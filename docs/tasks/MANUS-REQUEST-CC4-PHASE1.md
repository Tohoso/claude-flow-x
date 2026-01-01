# CC-4 Phase 1 タスク指示書

> **重要**: このタスクでは既存のRemote Cursorコードを最大限再利用します。
> 再利用元: `/home/ubuntu/remote-cursor/src/server/` (Remote Cursorサーバー)

## 担当者情報

| 項目 | 値 |
|:---|:---|
| 担当CC | CC-4 |
| 担当レイヤー | Mobile Bridge |
| ディレクトリ所有権 | `packages/mobile-bridge/` |
| ブランチプレフィックス | `feature/mobile-bridge/` |

---

## 概要

CC-4は、Mobile Bridge Layerを担当します。WebSocket ServerとPush Notification Serviceを実装し、Core LayerとMobile Appを接続します。Phase 1では、パッケージの初期化とWebSocket設計を行います。

---

## タスク一覧

### TASK-030: パッケージ初期化

**目的**: Mobile Bridge Layerのパッケージ構造を作成する

**前提条件**: TASK-001（monorepo構造）が完了していること

**作業内容**:

1. `packages/mobile-bridge/`ディレクトリを作成
```
packages/mobile-bridge/
├── src/
│   ├── index.ts
│   ├── websocket/
│   │   └── index.ts
│   ├── push/
│   │   └── index.ts
│   └── progress/
│       └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

2. `packages/mobile-bridge/package.json`を作成
```json
{
  "name": "@claude-flow-x/mobile-bridge",
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
    "lint": "eslint src/",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@claude-flow-x/core": "workspace:*",
    "@claude-flow-x/shared": "workspace:*",
    "socket.io": "^4.7.0",
    "expo-server-sdk": "^3.7.0",
    "chokidar": "^3.5.0"
  }
}
```

3. `packages/mobile-bridge/src/index.ts`を作成
```typescript
// Mobile Bridge Layer entry point
export * from './websocket';
export * from './push';
export * from './progress';
```

4. 各サブモジュールのプレースホルダーを作成
```typescript
// packages/mobile-bridge/src/websocket/index.ts
export function createWebSocketServer() {
  // TODO: Implement in Phase 3
}

// packages/mobile-bridge/src/push/index.ts
export function createPushNotificationService() {
  // TODO: Implement in Phase 3
}

// packages/mobile-bridge/src/progress/index.ts
export function createProgressParser() {
  // TODO: Implement in Phase 3
}
```

**完了条件**:
- [ ] `packages/mobile-bridge/`ディレクトリが作成されている
- [ ] `pnpm build`が成功する
- [ ] 他のパッケージから`@claude-flow-x/mobile-bridge`をインポートできる

**ブランチ**: `feature/mobile-bridge/task-030-package-init`

---

### TASK-031: WebSocketコード移植

**目的**: Remote CursorのWebSocket実装を移植する

**再利用元**: `remote-cursor/src/server/src/`

**作業内容**:

1. 既存ファイルを一括コピー
```bash
# WebSocket
mkdir -p packages/mobile-bridge/src/websocket
cp /home/ubuntu/remote-cursor/src/server/src/websocket/index.ts packages/mobile-bridge/src/websocket/index.ts

# Services
mkdir -p packages/mobile-bridge/src/push
cp /home/ubuntu/remote-cursor/src/server/src/services/pushNotificationService.ts packages/mobile-bridge/src/push/index.ts

mkdir -p packages/mobile-bridge/src/progress
cp /home/ubuntu/remote-cursor/src/server/src/services/progressParser.ts packages/mobile-bridge/src/progress/parser.ts
cp /home/ubuntu/remote-cursor/src/server/src/services/fileWatcher.ts packages/mobile-bridge/src/progress/watcher.ts

# Types
mkdir -p packages/mobile-bridge/src/types
cp /home/ubuntu/remote-cursor/src/server/src/types/index.ts packages/mobile-bridge/src/types/index.ts
```

2. 移植後のディレクトリ構造
```
packages/mobile-bridge/
├── src/
│   ├── websocket/     # ← remote-cursor/src/server/src/websocket/
│   ├── push/          # ← remote-cursor/src/server/src/services/pushNotificationService.ts
│   ├── progress/      # ← remote-cursor/src/server/src/services/progressParser.ts + fileWatcher.ts
│   ├── types/         # ← remote-cursor/src/server/src/types/
│   └── index.ts
└── package.json
```

3. Event Bus統合のための変更点を特定

4. 元の作業内容（設計）:
   Remote Cursor（`/home/ubuntu/remote-cursor/`）のWebSocket実装を分析析

2. WebSocket設計書を作成
```markdown
# WebSocket Server 設計書

## 概要

Mobile Bridge LayerのWebSocket Serverは、Core LayerのEvent Busと
Mobile Appを接続し、リアルタイムでイベントを配信します。

## アーキテクチャ

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Event Bus  │────▶│  WebSocket  │────▶│  Mobile App │
│   (Core)    │◀────│   Server    │◀────│  (Client)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Server → Client イベント

| イベント | ペイロード | トリガー |
|:---|:---|:---|
| connection_status | { connected: boolean } | 接続/切断時 |
| project_status | ProjectStatus | 初期接続時、進捗更新時 |
| task_update | Task | タスク状態変更時 |
| blocker_alert | Blocker | ブロッカー検出時 |
| agent_status | Agent | エージェント状態変更時 |

## Client → Server イベント

| イベント | ペイロード | 処理 |
|:---|:---|:---|
| instruction | { targetId, instruction } | Swarm Layerに転送 |
| register_push_token | { token, platform } | トークン登録 |
| unregister_push_token | { token } | トークン解除 |

## Event Bus 購読

| Event Bus イベント | WebSocket イベント |
|:---|:---|
| swarm:task_started | task_update |
| swarm:task_completed | task_update |
| swarm:task_failed | task_update |
| swarm:blocker_detected | blocker_alert |
| swarm:agent_spawned | agent_status |
| swarm:agent_terminated | agent_status |

## 実装詳細

### 接続管理

- Socket.IO v4を使用
- CORS: 全オリジン許可（開発時）
- 認証: 将来的にJWT対応

### 初期接続時

1. クライアント接続
2. `connection_status`送信
3. State Managerから現在の状態を取得
4. `project_status`送信

### 再接続時

- 自動再接続（exponential backoff）
- 再接続後に`project_status`を再送信
```

3. Phase 3のタスク分割を作成
```markdown
## Phase 3 タスク分割案

| Task ID | 機能 | 見積もり |
|:---|:---|:---|
| TASK-032 | WebSocket Server実装 | 8h |
| TASK-033 | Push Notification Service | 6h |
| TASK-034 | Progress Parser移植 | 4h |
| TASK-035 | Event Bridge実装 | 6h |
```

4. `docs/design/MOBILE_BRIDGE_DESIGN.md`を作成

**完了条件**:
- [ ] WebSocket設計書が作成されている
- [ ] Event Bus連携が設計されている
- [ ] Phase 3のタスク分割が完了している

**ブランチ**: `feature/mobile-bridge/task-031-websocket-design`

---

## 参考資料

### Remote Cursor の WebSocket 実装

```
remote-cursor/src/server/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── websocket/
│   │   └── index.ts          # WebSocket Server
│   ├── services/
│   │   ├── fileWatcher.ts    # ファイル監視
│   │   ├── progressParser.ts # progress.md パーサー
│   │   └── pushNotificationService.ts
│   └── types/
│       └── index.ts
```

### 主要な移植ポイント

1. **WebSocket Server**: `src/websocket/index.ts`
   - Socket.IO設定
   - イベントハンドラ
   - 接続管理

2. **Progress Parser**: `src/services/progressParser.ts`
   - progress.mdのパース
   - タスク状態の抽出

3. **Push Notification**: `src/services/pushNotificationService.ts`
   - Expo Push Notifications
   - トークン管理

---

## 作業フロー

1. `develop`ブランチから作業ブランチを作成
2. タスクを実装
3. `progress.md`を更新
4. PRを作成（ベース: `develop`）
5. Manusのレビューを待つ

---

## 注意事項

- 他のCCのディレクトリは編集しない
- Phase 1では実装は行わず、準備と設計のみ
- Remote Cursorのコードは参照のみ
