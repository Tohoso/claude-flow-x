# システムアーキテクチャ設計書

## 1. 概要

Claude-Flow-Xは、4つのレイヤーで構成されるモジュラーアーキテクチャを採用しています。各レイヤーは独立したパッケージとして実装され、Event Busを介して疎結合に連携します。

## 2. レイヤー構成

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Presentation Layer                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Mobile App (CC-5)                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │Dashboard │  │ Track    │  │ Blocker  │  │ Activity │            │   │
│  │  │ Screen   │  │ Detail   │  │ Detail   │  │   Log    │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Integration Layer                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  GitHub Layer    │  │  Mobile Bridge   │  │  CLI Interface   │         │
│  │     (CC-2)       │  │     (CC-4)       │  │   (existing)     │         │
│  │                  │  │                  │  │                  │         │
│  │  - Triggers      │  │  - WebSocket     │  │  - Commands      │         │
│  │  - Tracking      │  │  - Push Notify   │  │  - Interactive   │         │
│  │  - PR Actions    │  │  - Progress      │  │  - Config        │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Business Layer                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Swarm Layer (CC-3)                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  Agent   │  │Coordinator│  │ Executor │  │  Memory  │            │   │
│  │  │ Registry │  │          │  │          │  │  System  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                              Foundation Layer                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Core Layer (CC-1)                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  Event   │  │  State   │  │  Config  │  │  Logger  │            │   │
│  │  │   Bus    │  │ Manager  │  │ Manager  │  │          │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Core Layer（CC-1）

### 3.1 Event Bus

各レイヤー間の通信を担う中央集権的なイベントバスです。

```typescript
// packages/core/src/event-bus/index.ts

import { EventEmitter } from 'node:events';
import { z } from 'zod';

export class EventBus {
  private emitter = new EventEmitter();
  private static instance: EventBus;

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  emit<T extends AppEvent>(event: T): void {
    this.emitter.emit(event.type, event);
  }

  on<E extends AppEvent['type']>(
    type: E,
    handler: (event: Extract<AppEvent, { type: E }>) => void
  ): void {
    this.emitter.on(type, handler);
  }

  off(type: string, handler: Function): void {
    this.emitter.off(type, handler);
  }
}
```

### 3.2 State Manager

Zustandベースの中央集権的状態管理です。

```typescript
// packages/core/src/state/index.ts

import { createStore } from 'zustand/vanilla';

export interface AppState {
  agents: Map<string, Agent>;
  tasks: Map<string, Task>;
  blockers: Blocker[];
  progress: ProjectProgress;
}

export const store = createStore<AppState>(() => ({
  agents: new Map(),
  tasks: new Map(),
  blockers: [],
  progress: { completed: 0, total: 0, percentage: 0 },
}));
```

### 3.3 Config Manager

cosmiconfigベースの階層的設定管理です。

```typescript
// packages/core/src/config/index.ts

import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

export const ConfigSchema = z.object({
  project: z.object({
    name: z.string(),
    repository: z.string().optional(),
  }),
  github: z.object({
    enabled: z.boolean().default(true),
    triggers: z.object({
      mention: z.boolean().default(true),
      pr_opened: z.boolean().default(true),
    }),
  }).optional(),
  swarm: z.object({
    topology: z.enum(['hierarchical', 'mesh']).default('hierarchical'),
    max_agents: z.number().min(1).default(10),
  }).optional(),
  mobile: z.object({
    enabled: z.boolean().default(true),
    websocket_port: z.number().default(3001),
  }).optional(),
});

export async function loadConfig() {
  const explorer = cosmiconfig('claude-flow-x');
  const result = await explorer.search();
  return ConfigSchema.parse(result?.config ?? {});
}
```

## 4. GitHub Layer（CC-2）

### 4.1 Mention Trigger

`@claude`メンションを検出してエージェントを起動します。

```typescript
// packages/github/src/triggers/mention.ts

import { eventBus } from '@claude-flow-x/core';

export function handleMention(context: GitHubContext) {
  const mention = parseMention(context.comment);
  
  eventBus.emit({
    type: 'github:mention',
    payload: {
      repository: context.repository,
      issueOrPr: context.issueNumber,
      instruction: mention.instruction,
      user: context.user,
    },
  });
}
```

### 4.2 Tracking Comment

PRに進捗チェックボックスを投稿します。

```typescript
// packages/github/src/tracking/comment.ts

export async function postTrackingComment(pr: PullRequest, tasks: Task[]) {
  const body = tasks.map(task => 
    `- [${task.completed ? 'x' : ' '}] ${task.description}`
  ).join('\n');
  
  await octokit.issues.createComment({
    owner: pr.owner,
    repo: pr.repo,
    issue_number: pr.number,
    body: `## Claude-Flow-X Progress\n\n${body}`,
  });
}
```

## 5. Swarm Layer（CC-3）

### 5.1 Agent Registry

54種類以上のエージェントを管理します。

```typescript
// packages/swarm/src/agents/registry.ts

export const agentRegistry = new Map<string, AgentDefinition>([
  ['coder', {
    name: 'Coder',
    capabilities: ['code_generation', 'code_review'],
    systemPrompt: '...',
  }],
  ['reviewer', {
    name: 'Reviewer',
    capabilities: ['code_review', 'security_audit'],
    systemPrompt: '...',
  }],
  // ... 他のエージェント
]);
```

### 5.2 Coordinator

タスクの分散と調整を行います。

```typescript
// packages/swarm/src/coordinator/index.ts

import { eventBus, store } from '@claude-flow-x/core';

export class Coordinator {
  async assignTask(task: Task) {
    const agent = this.selectBestAgent(task);
    
    eventBus.emit({
      type: 'swarm:task_assigned',
      payload: { taskId: task.id, agentId: agent.id },
    });
    
    store.getState().updateTask(task.id, { status: 'assigned', agentId: agent.id });
  }
}
```

## 6. Mobile Bridge Layer（CC-4）

### 6.1 WebSocket Server

リアルタイムイベント配信を行います。

```typescript
// packages/mobile-bridge/src/websocket/server.ts

import { Server } from 'socket.io';
import { eventBus, store } from '@claude-flow-x/core';

export function createWebSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } });
  
  // Event Bus → WebSocket
  eventBus.on('swarm:task_completed', (event) => {
    io.emit('task_update', event.payload);
  });
  
  eventBus.on('swarm:blocker_detected', (event) => {
    io.emit('blocker_alert', event.payload);
  });
  
  // WebSocket → Event Bus
  io.on('connection', (socket) => {
    socket.emit('project_status', store.getState().progress);
    
    socket.on('instruction', (data) => {
      eventBus.emit({
        type: 'mobile:instruction',
        payload: data,
      });
    });
  });
}
```

### 6.2 Push Notification

Expo Push Notificationsによる通知を行います。

```typescript
// packages/mobile-bridge/src/push/service.ts

import Expo from 'expo-server-sdk';
import { eventBus } from '@claude-flow-x/core';

export class PushNotificationService {
  private expo = new Expo();
  private tokens = new Set<string>();

  constructor() {
    eventBus.on('swarm:blocker_detected', (event) => {
      this.sendBlockerAlert(event.payload);
    });
  }

  async sendBlockerAlert(blocker: Blocker) {
    const messages = [...this.tokens].map(token => ({
      to: token,
      title: '⚠️ ブロッカー検出',
      body: blocker.reason,
      priority: 'high' as const,
    }));
    
    await this.expo.sendPushNotificationsAsync(messages);
  }
}
```

## 7. Mobile App Layer（CC-5）

### 7.1 画面構成

Remote Cursorの設計を踏襲します。

| 画面 | 説明 |
|:---|:---|
| Dashboard | 円形プログレス、トラックカード、ブロッカーアラート |
| Track Detail | タスクタイムライン |
| Blocker Detail | ブロッカー詳細、解決指示フォーム |
| Activity Log | フィルタリング可能なログ一覧 |

### 7.2 状態管理

Zustandを使用してローカル状態を管理します。

```typescript
// packages/mobile-app/stores/dashboardStore.ts

import { create } from 'zustand';

interface DashboardState {
  progress: ProjectProgress;
  tracks: Track[];
  blockers: Blocker[];
  updateFromServer: (data: ProjectStatus) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  progress: { completed: 0, total: 0, percentage: 0 },
  tracks: [],
  blockers: [],
  updateFromServer: (data) => set({
    progress: data.progress,
    tracks: data.tracks,
    blockers: data.blockers,
  }),
}));
```

## 8. イベントフロー

### 8.1 GitHub → Swarm → Mobile

```
1. GitHub: @claude メンション検出
   │
   ▼
2. GitHub Layer: github:mention イベント発行
   │
   ▼
3. Swarm Layer: タスク作成、エージェント割り当て
   │
   ├─→ swarm:task_assigned イベント発行
   │
   ▼
4. Mobile Bridge: WebSocket で task_update 送信
   │
   ▼
5. Mobile App: ダッシュボード更新
```

### 8.2 Mobile → Swarm → GitHub

```
1. Mobile App: ブロッカー解決指示を送信
   │
   ▼
2. Mobile Bridge: mobile:instruction イベント発行
   │
   ▼
3. Swarm Layer: エージェント再起動、タスク実行
   │
   ├─→ swarm:task_completed イベント発行
   │
   ▼
4. GitHub Layer: PR更新、コメント投稿
```

## 9. データフロー

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│  Event Bus  │────▶│   Swarm     │
│   Layer     │◀────│             │◀────│   Layer     │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   State     │
                    │   Manager   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Mobile    │
                    │   Bridge    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Mobile    │
                    │    App      │
                    └─────────────┘
```
