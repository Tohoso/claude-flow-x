# CC-1 Phase 1 タスク指示書

> **重要**: このタスクでは既存のClaude-Flowコードを最大限再利用します。
> 再利用元: `_upstream/claude-flow/` (フォーク元リポジトリ)

## 担当者情報

| 項目 | 値 |
|:---|:---|
| 担当CC | CC-1 |
| 担当レイヤー | Core Layer |
| ディレクトリ所有権 | `packages/core/` |
| ブランチプレフィックス | `feature/core/` |

---

## 概要

CC-1は、Claude-Flow-Xの基盤となるCore Layerを構築します。Event Bus、State Manager、Config Manager、Loggerを実装し、他のレイヤーが依存する共通基盤を提供します。

---

## タスク一覧

### TASK-001: monorepo構造のセットアップ

**目的**: pnpm workspaceを使用したmonorepo構造を構築する

**作業内容**:

1. ルートの`package.json`を更新
```json
{
  "name": "claude-flow-x",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

2. `pnpm-workspace.yaml`を作成
```yaml
packages:
  - 'packages/*'
```

3. `packages/core/`ディレクトリを作成
```
packages/core/
├── src/
│   ├── index.ts
│   ├── event-bus/
│   ├── state/
│   ├── config/
│   └── logger/
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

4. `packages/core/package.json`を作成
```json
{
  "name": "@claude-flow-x/core",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "cosmiconfig": "^9.0.0",
    "nanoid": "^5.0.0"
  }
}
```

5. `packages/shared/`ディレクトリを作成（共有型定義用）
```
packages/shared/
├── src/
│   └── types/
│       ├── index.ts
│       └── events.ts
├── package.json
└── tsconfig.json
```

**完了条件**:
- [ ] `pnpm install`が成功する
- [ ] `pnpm build`が成功する
- [ ] `packages/core/`と`packages/shared/`が作成されている

**ブランチ**: `feature/core/task-001-monorepo-setup`

---

### TASK-002: Event Bus実装

**目的**: 各レイヤー間の通信を担うEvent Busを実装する

**再利用元**: `claude-flow/src/core/event-bus.ts` (4.5KB)

**作業内容**:

1. 既存ファイルをコピー
```bash
cp _upstream/claude-flow/core/event-bus.ts packages/core/src/event-bus/index.ts
```

2. 型定義を`@claude-flow-x/shared`に分離

1. `packages/core/src/event-bus/index.ts`を作成
```typescript
import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import type { AppEvent, EventHandler } from '@claude-flow-x/shared';

export class EventBus {
  private emitter = new EventEmitter();
  private static instance: EventBus;

  private constructor() {
    this.emitter.setMaxListeners(100);
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  emit<T extends AppEvent>(event: Omit<T, 'id' | 'timestamp'>): void {
    const fullEvent = {
      ...event,
      id: nanoid(),
      timestamp: new Date(),
    } as T;
    
    this.emitter.emit(event.type, fullEvent);
    this.emitter.emit('*', fullEvent); // Wildcard listener
  }

  on<E extends AppEvent['type']>(
    type: E | '*',
    handler: EventHandler<E>
  ): () => void {
    this.emitter.on(type, handler);
    return () => this.emitter.off(type, handler);
  }

  once<E extends AppEvent['type']>(
    type: E,
    handler: EventHandler<E>
  ): void {
    this.emitter.once(type, handler);
  }

  off(type: string, handler: Function): void {
    this.emitter.off(type, handler);
  }

  removeAllListeners(type?: string): void {
    this.emitter.removeAllListeners(type);
  }
}

export const eventBus = EventBus.getInstance();
```

2. `packages/shared/src/types/events.ts`にイベント型を定義
```typescript
export interface BaseEvent {
  id: string;
  timestamp: Date;
  source: 'system' | 'github' | 'swarm' | 'mobile';
  type: string;
}

// System Events
export interface SystemInitializedEvent extends BaseEvent {
  source: 'system';
  type: 'system:initialized';
  payload: {
    version: string;
    enabledLayers: string[];
  };
}

// ... 他のイベント型（EVENT_SCHEMA.mdを参照）

export type AppEvent = 
  | SystemInitializedEvent
  | SystemShutdownEvent
  | SystemErrorEvent
  // ... 他のイベント型

export type EventHandler<E extends AppEvent['type']> = 
  (event: Extract<AppEvent, { type: E }>) => void;
```

3. テストを作成
```typescript
// packages/core/src/event-bus/__tests__/event-bus.test.ts
import { describe, it, expect, vi } from 'vitest';
import { eventBus } from '../index';

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const handler = vi.fn();
    eventBus.on('system:initialized', handler);
    
    eventBus.emit({
      source: 'system',
      type: 'system:initialized',
      payload: { version: '0.1.0', enabledLayers: ['core'] },
    });
    
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
```

**完了条件**:
- [ ] Event Busがシングルトンとして動作する
- [ ] イベントの発行と購読ができる
- [ ] ワイルドカードリスナー（`*`）が動作する
- [ ] テストがパスする

**ブランチ**: `feature/core/task-002-event-bus`

---

### TASK-003: State Manager実装

**目的**: Zustandベースの中央集権的状態管理を実装する

**作業内容**:

1. `packages/core/src/state/index.ts`を作成
```typescript
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Agent, Task, Blocker, ProjectProgress } from '@claude-flow-x/shared';

export interface AppState {
  // Agents
  agents: Map<string, Agent>;
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  
  // Tasks
  tasks: Map<string, Task>;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  
  // Blockers
  blockers: Blocker[];
  addBlocker: (blocker: Blocker) => void;
  resolveBlocker: (blockerId: string) => void;
  
  // Progress
  progress: ProjectProgress;
  updateProgress: () => void;
}

export const createAppStore = (): StoreApi<AppState> => {
  return createStore<AppState>((set, get) => ({
    // Initial state
    agents: new Map(),
    tasks: new Map(),
    blockers: [],
    progress: { completed: 0, total: 0, percentage: 0 },
    
    // Agent actions
    addAgent: (agent) => set((state) => {
      const agents = new Map(state.agents);
      agents.set(agent.id, agent);
      return { agents };
    }),
    // ... 他のアクション
    
    // Progress calculation
    updateProgress: () => set((state) => {
      const tasks = Array.from(state.tasks.values());
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      return {
        progress: {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    }),
  }));
};

export const store = createAppStore();
```

2. 型定義を追加
```typescript
// packages/shared/src/types/state.ts
export interface Agent {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'error';
  currentTaskId?: string;
  capabilities: string[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  agentId?: string;
  progress: number;
  dependencies: string[];
}

export interface Blocker {
  id: string;
  taskId: string;
  reason: string;
  detectedAt: Date;
  resolved: boolean;
}

export interface ProjectProgress {
  completed: number;
  total: number;
  percentage: number;
}
```

**完了条件**:
- [ ] 状態の読み取りと更新ができる
- [ ] 進捗計算が正しく動作する
- [ ] テストがパスする

**ブランチ**: `feature/core/task-003-state-manager`

---

### TASK-004: Config Manager実装

**目的**: cosmiconfigベースの階層的設定管理を実装する

**再利用元**: `claude-flow/src/core/ConfigManager.ts` (8.5KB)

**作業内容**:

1. 既存ファイルをコピー
```bash
cp _upstream/claude-flow/core/ConfigManager.ts packages/core/src/config/index.ts
```

2. Zodスキーマを追加して型安全性を強化

1. `packages/core/src/config/index.ts`を作成
```typescript
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
    }).default({}),
  }).default({}),
  swarm: z.object({
    topology: z.enum(['hierarchical', 'mesh']).default('hierarchical'),
    max_agents: z.number().min(1).default(10),
  }).default({}),
  mobile: z.object({
    enabled: z.boolean().default(true),
    websocket_port: z.number().default(3001),
    push_notifications: z.boolean().default(true),
  }).default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config | null = null;

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async load(): Promise<Config> {
    const explorer = cosmiconfig('claude-flow-x');
    const result = await explorer.search();
    
    const rawConfig = result?.config ?? {};
    this.config = ConfigSchema.parse(rawConfig);
    return this.config;
  }

  get(): Config {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.');
    }
    return this.config;
  }
}

export const configManager = ConfigManager.getInstance();
```

2. サンプル設定ファイルを作成
```javascript
// claude-flow-x.config.js (example)
module.exports = {
  project: {
    name: 'my-project',
    repository: 'owner/repo',
  },
  github: {
    enabled: true,
    triggers: {
      mention: true,
      pr_opened: true,
    },
  },
  swarm: {
    topology: 'hierarchical',
    max_agents: 10,
  },
  mobile: {
    enabled: true,
    websocket_port: 3001,
    push_notifications: true,
  },
};
```

**完了条件**:
- [ ] 設定ファイルの自動検索ができる
- [ ] 環境変数によるオーバーライドができる
- [ ] Zodによるバリデーションが動作する
- [ ] テストがパスする

**ブランチ**: `feature/core/task-004-config-manager`

---

### TASK-005: Logger実装

**目的**: 構造化ログを出力するLoggerを実装する

**再利用元**: `claude-flow/src/core/logger.ts` (8.4KB)

**作業内容**:

1. 既存ファイルをコピー
```bash
cp _upstream/claude-flow/core/logger.ts packages/core/src/logger/index.ts
```

2. 構造化ログ形式に拡張（JSON出力オプション追加）

1. `packages/core/src/logger/index.ts`を作成
```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  source: string;
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private source: string;
  private static globalLevel: LogLevel = 'info';

  constructor(source: string) {
    this.source = source;
  }

  static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      source: this.source,
      message,
      context,
    };
    
    // Console output
    const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}] [${this.source}]`;
    console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, context ?? '');
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
}

export const createLogger = (source: string): Logger => new Logger(source);
```

**完了条件**:
- [ ] 4つのログレベルが動作する
- [ ] 構造化コンテキストを出力できる
- [ ] テストがパスする

**ブランチ**: `feature/core/task-005-logger`

---

### TASK-006: 共有型定義

**目的**: 全レイヤーで使用する共有型を定義する

**作業内容**:

1. `packages/shared/src/types/`に型定義ファイルを作成
   - `events.ts`: イベント型（EVENT_SCHEMA.mdを参照）
   - `state.ts`: 状態型（Agent, Task, Blocker等）
   - `config.ts`: 設定型
   - `index.ts`: エクスポート

2. `packages/shared/package.json`を作成
```json
{
  "name": "@claude-flow-x/shared",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup"
  }
}
```

**完了条件**:
- [ ] 全イベント型が定義されている
- [ ] 全状態型が定義されている
- [ ] 他のパッケージからインポートできる

**ブランチ**: `feature/core/task-006-shared-types`

---

## 作業フロー

1. `develop`ブランチから作業ブランチを作成
2. タスクを実装
3. テストを作成・実行
4. `progress.md`を更新
5. PRを作成（ベース: `develop`）
6. Manusのレビューを待つ

---

## 注意事項

- 他のCCのディレクトリ（`packages/github/`等）は編集しない
- 共有型定義（`packages/shared/`）は新規ファイルの追加のみ
- 既存のClaude-Flowコードは参照のみ、直接編集しない
