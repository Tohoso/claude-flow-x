# イベントスキーマ設計書

## 1. 概要

Claude-Flow-Xでは、各レイヤー間の通信にEvent Busを使用します。本ドキュメントでは、システム全体で使用されるイベントスキーマを定義します。

## 2. イベント命名規則

```
<source>:<action>
```

| Source | 説明 |
|:---|:---|
| `system` | システム全体のイベント |
| `github` | GitHub Layer のイベント |
| `swarm` | Swarm Layer のイベント |
| `mobile` | Mobile Layer のイベント |

## 3. Base Event Schema

すべてのイベントは以下の基本スキーマを継承します。

```typescript
interface BaseEvent {
  id: string;           // ユニークID (nanoid)
  timestamp: Date;      // イベント発生時刻
  source: 'system' | 'github' | 'swarm' | 'mobile';
  type: string;         // イベントタイプ
  payload: unknown;     // イベント固有のデータ
}
```

## 4. System Events

### 4.1 system:initialized

システム初期化完了時に発行されます。

```typescript
interface SystemInitializedEvent extends BaseEvent {
  source: 'system';
  type: 'system:initialized';
  payload: {
    version: string;
    config: Config;
    enabledLayers: string[];
  };
}
```

### 4.2 system:shutdown

システムシャットダウン時に発行されます。

```typescript
interface SystemShutdownEvent extends BaseEvent {
  source: 'system';
  type: 'system:shutdown';
  payload: {
    reason: 'user_request' | 'error' | 'timeout';
    message?: string;
  };
}
```

### 4.3 system:error

システムエラー発生時に発行されます。

```typescript
interface SystemErrorEvent extends BaseEvent {
  source: 'system';
  type: 'system:error';
  payload: {
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
  };
}
```

## 5. GitHub Events

### 5.1 github:mention

`@claude`メンション検出時に発行されます。

```typescript
interface GitHubMentionEvent extends BaseEvent {
  source: 'github';
  type: 'github:mention';
  payload: {
    repository: string;       // "owner/repo"
    issueOrPr: number;        // Issue/PR番号
    commentId: number;        // コメントID
    instruction: string;      // メンション後のテキスト
    user: string;             // メンションしたユーザー
    context: {
      title: string;
      body: string;
      labels: string[];
    };
  };
}
```

### 5.2 github:pr_opened

PR作成時に発行されます。

```typescript
interface GitHubPROpenedEvent extends BaseEvent {
  source: 'github';
  type: 'github:pr_opened';
  payload: {
    repository: string;
    prNumber: number;
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
    user: string;
    files: string[];
  };
}
```

### 5.3 github:pr_updated

PR更新時に発行されます。

```typescript
interface GitHubPRUpdatedEvent extends BaseEvent {
  source: 'github';
  type: 'github:pr_updated';
  payload: {
    repository: string;
    prNumber: number;
    action: 'synchronize' | 'edited' | 'ready_for_review';
    changes?: {
      title?: { from: string; to: string };
      body?: { from: string; to: string };
    };
  };
}
```

### 5.4 github:review_submitted

レビュー提出時に発行されます。

```typescript
interface GitHubReviewSubmittedEvent extends BaseEvent {
  source: 'github';
  type: 'github:review_submitted';
  payload: {
    repository: string;
    prNumber: number;
    reviewId: number;
    state: 'approved' | 'changes_requested' | 'commented';
    body: string;
    user: string;
  };
}
```

### 5.5 github:comment_posted

コメント投稿完了時に発行されます。

```typescript
interface GitHubCommentPostedEvent extends BaseEvent {
  source: 'github';
  type: 'github:comment_posted';
  payload: {
    repository: string;
    issueOrPr: number;
    commentId: number;
    body: string;
    isTrackingComment: boolean;
  };
}
```

## 6. Swarm Events

### 6.1 swarm:task_created

タスク作成時に発行されます。

```typescript
interface SwarmTaskCreatedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:task_created';
  payload: {
    taskId: string;
    description: string;
    priority: number;
    dependencies: string[];
    metadata?: Record<string, unknown>;
  };
}
```

### 6.2 swarm:task_assigned

タスク割り当て時に発行されます。

```typescript
interface SwarmTaskAssignedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:task_assigned';
  payload: {
    taskId: string;
    agentId: string;
    agentType: string;
    estimatedDuration?: number;
  };
}
```

### 6.3 swarm:task_started

タスク開始時に発行されます。

```typescript
interface SwarmTaskStartedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:task_started';
  payload: {
    taskId: string;
    agentId: string;
  };
}
```

### 6.4 swarm:task_progress

タスク進捗更新時に発行されます。

```typescript
interface SwarmTaskProgressEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:task_progress';
  payload: {
    taskId: string;
    agentId: string;
    progress: number;         // 0-100
    message?: string;
  };
}
```

### 6.5 swarm:task_completed

タスク完了時に発行されます。

```typescript
interface SwarmTaskCompletedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:task_completed';
  payload: {
    taskId: string;
    agentId: string;
    result: {
      success: boolean;
      output?: unknown;
      artifacts?: string[];
    };
    duration: number;
  };
}
```

### 6.6 swarm:task_failed

タスク失敗時に発行されます。

```typescript
interface SwarmTaskFailedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:task_failed';
  payload: {
    taskId: string;
    agentId: string;
    error: {
      code: string;
      message: string;
      recoverable: boolean;
    };
    retryCount: number;
  };
}
```

### 6.7 swarm:blocker_detected

ブロッカー検出時に発行されます。

```typescript
interface SwarmBlockerDetectedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:blocker_detected';
  payload: {
    blockerId: string;
    taskId: string;
    agentId: string;
    reason: string;
    affectedTasks: string[];
    suggestedActions?: string[];
  };
}
```

### 6.8 swarm:blocker_resolved

ブロッカー解決時に発行されます。

```typescript
interface SwarmBlockerResolvedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:blocker_resolved';
  payload: {
    blockerId: string;
    resolution: string;
    resolvedBy: 'agent' | 'user';
  };
}
```

### 6.9 swarm:agent_spawned

エージェント起動時に発行されます。

```typescript
interface SwarmAgentSpawnedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:agent_spawned';
  payload: {
    agentId: string;
    agentType: string;
    capabilities: string[];
  };
}
```

### 6.10 swarm:agent_terminated

エージェント終了時に発行されます。

```typescript
interface SwarmAgentTerminatedEvent extends BaseEvent {
  source: 'swarm';
  type: 'swarm:agent_terminated';
  payload: {
    agentId: string;
    reason: 'completed' | 'error' | 'timeout' | 'user_request';
    tasksCompleted: number;
  };
}
```

## 7. Mobile Events

### 7.1 mobile:connected

モバイルクライアント接続時に発行されます。

```typescript
interface MobileConnectedEvent extends BaseEvent {
  source: 'mobile';
  type: 'mobile:connected';
  payload: {
    clientId: string;
    deviceInfo?: {
      platform: 'ios' | 'android' | 'web';
      version: string;
    };
  };
}
```

### 7.2 mobile:disconnected

モバイルクライアント切断時に発行されます。

```typescript
interface MobileDisconnectedEvent extends BaseEvent {
  source: 'mobile';
  type: 'mobile:disconnected';
  payload: {
    clientId: string;
    reason: 'user_request' | 'timeout' | 'error';
  };
}
```

### 7.3 mobile:instruction

ユーザーからの指示受信時に発行されます。

```typescript
interface MobileInstructionEvent extends BaseEvent {
  source: 'mobile';
  type: 'mobile:instruction';
  payload: {
    clientId: string;
    targetTaskId?: string;
    targetBlockerId?: string;
    instruction: string;
  };
}
```

### 7.4 mobile:push_token_registered

プッシュトークン登録時に発行されます。

```typescript
interface MobilePushTokenRegisteredEvent extends BaseEvent {
  source: 'mobile';
  type: 'mobile:push_token_registered';
  payload: {
    clientId: string;
    token: string;
    platform: 'ios' | 'android';
  };
}
```

## 8. イベント一覧

| イベント | 発行元 | 購読先 |
|:---|:---|:---|
| `system:initialized` | Core | All |
| `system:shutdown` | Core | All |
| `system:error` | Core | All |
| `github:mention` | GitHub | Swarm |
| `github:pr_opened` | GitHub | Swarm |
| `github:pr_updated` | GitHub | Swarm |
| `github:review_submitted` | GitHub | Swarm |
| `github:comment_posted` | GitHub | Mobile Bridge |
| `swarm:task_created` | Swarm | Mobile Bridge |
| `swarm:task_assigned` | Swarm | Mobile Bridge |
| `swarm:task_started` | Swarm | Mobile Bridge |
| `swarm:task_progress` | Swarm | Mobile Bridge |
| `swarm:task_completed` | Swarm | GitHub, Mobile Bridge |
| `swarm:task_failed` | Swarm | GitHub, Mobile Bridge |
| `swarm:blocker_detected` | Swarm | GitHub, Mobile Bridge |
| `swarm:blocker_resolved` | Swarm | GitHub, Mobile Bridge |
| `swarm:agent_spawned` | Swarm | Mobile Bridge |
| `swarm:agent_terminated` | Swarm | Mobile Bridge |
| `mobile:connected` | Mobile Bridge | Core |
| `mobile:disconnected` | Mobile Bridge | Core |
| `mobile:instruction` | Mobile Bridge | Swarm |
| `mobile:push_token_registered` | Mobile Bridge | Core |
