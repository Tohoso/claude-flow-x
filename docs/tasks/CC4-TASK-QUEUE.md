# CC-4 タスクキュー

> **担当レイヤー**: Mobile Bridge Layer
> **ディレクトリ所有権**: `packages/mobile-bridge/`
> **ブランチプレフィックス**: `feature/mobile-bridge/`
> **ベースブランチ**: `develop`

---

## タスク実行順序

以下のタスクを順番に実行してください。各タスク完了後、PRを作成してManusのレビューを待ってください。

---

### TASK-030: パッケージ初期化とコード移植

**前提条件**: TASK-001（CC-1）がマージされていること

**ブランチ**: `feature/mobile-bridge/task-030-package-init`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mobile-bridge/task-030-package-init
```

2. packages/mobile-bridge/package.jsonを作成
```bash
mkdir -p packages/mobile-bridge/src
cat > packages/mobile-bridge/package.json << 'EOF'
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
    "chokidar": "^3.5.0",
    "expo-server-sdk": "^3.7.0"
  }
}
EOF
```

3. 既存コードを一括コピー
```bash
# WebSocket
mkdir -p packages/mobile-bridge/src/websocket
cp /home/ubuntu/remote-cursor/src/server/src/websocket/index.ts packages/mobile-bridge/src/websocket/index.ts

# Services
mkdir -p packages/mobile-bridge/src/services
cp /home/ubuntu/remote-cursor/src/server/src/services/progressParser.ts packages/mobile-bridge/src/services/progressParser.ts
cp /home/ubuntu/remote-cursor/src/server/src/services/fileWatcher.ts packages/mobile-bridge/src/services/fileWatcher.ts
cp /home/ubuntu/remote-cursor/src/server/src/services/pushNotificationService.ts packages/mobile-bridge/src/services/pushNotificationService.ts

# Types
mkdir -p packages/mobile-bridge/src/types
cp /home/ubuntu/remote-cursor/src/common/types/index.ts packages/mobile-bridge/src/types/index.ts
```

4. packages/mobile-bridge/tsup.config.tsを作成
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
```

5. packages/mobile-bridge/src/index.tsを作成
```typescript
export * from './websocket';
export * from './services/progressParser';
export * from './services/fileWatcher';
export * from './services/pushNotificationService';
export * from './types';
```

6. progress.mdを更新

7. PRを作成
```bash
git add .
git commit -m "feat(mobile-bridge): Initialize package and migrate Remote Cursor server code"
git push origin feature/mobile-bridge/task-030-package-init
gh pr create --base develop --title "feat(mobile-bridge): Initialize package and migrate code (TASK-030)" --body "..."
```

**完了条件**:
- [ ] `packages/mobile-bridge/package.json`が存在する
- [ ] 全てのコードが移植されている
- [ ] `pnpm install`が成功する

---

### TASK-031: importパス修正とビルド確認

**前提条件**: TASK-030がマージされていること

**ブランチ**: `feature/mobile-bridge/task-031-fix-imports`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mobile-bridge/task-031-fix-imports
```

2. 各ファイルのimportパスを修正
   - 相対パスに変更
   - `@common/types`を`./types`に変更

3. TypeScriptエラーを修正

4. ビルドを確認
```bash
cd packages/mobile-bridge
pnpm build
```

5. progress.mdを更新

6. PRを作成

**完了条件**:
- [ ] 全てのimportパスが修正されている
- [ ] `pnpm build`が成功する
- [ ] TypeScriptエラーがない

---

### TASK-032: Event Bus統合

**前提条件**: TASK-031がマージされていること、TASK-002（CC-1）がマージされていること

**ブランチ**: `feature/mobile-bridge/task-032-event-bus-integration`

**作業内容**:

1. developを最新に更新
2. Event Busをインポート
```typescript
import { eventBus } from '@claude-flow-x/core';
```

3. Event Busイベントを購読してWebSocketに転送
```typescript
// Swarmイベントを購読
eventBus.on('swarm:task_started', (data) => {
  io.emit('task_update', data);
});

eventBus.on('swarm:task_completed', (data) => {
  io.emit('task_update', data);
});

eventBus.on('swarm:blocker_detected', (data) => {
  io.emit('blocker_alert', data);
  pushNotificationService.sendBlockerAlert(data);
});

// GitHubイベントを購読
eventBus.on('github:pr_opened', (data) => {
  io.emit('github_event', { type: 'pr_opened', ...data });
});
```

4. progress.mdを更新

5. PRを作成

**完了条件**:
- [ ] Event Busと連携している
- [ ] Swarmイベントがモバイルに転送される
- [ ] GitHubイベントがモバイルに転送される
- [ ] ブロッカー検出時にプッシュ通知が送信される

---

### TASK-033: サーバーエントリポイント作成

**前提条件**: TASK-032がマージされていること

**ブランチ**: `feature/mobile-bridge/task-033-server-entry`

**作業内容**:

1. developを最新に更新
2. packages/mobile-bridge/src/server.tsを作成
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupWebSocket } from './websocket';
import { FileWatcher } from './services/fileWatcher';
import { eventBus } from '@claude-flow-x/core';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
});

// WebSocket setup
const fileWatcher = new FileWatcher(process.env.PROJECT_ROOT || '.');
setupWebSocket(io, fileWatcher);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Mobile Bridge server running on port ${PORT}`);
  eventBus.emit('mobile_bridge:server_started', { port: PORT });
});
```

3. package.jsonにstartスクリプトを追加
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "tsup --watch & nodemon dist/server.js"
  }
}
```

4. progress.mdを更新

5. PRを作成

**完了条件**:
- [ ] `packages/mobile-bridge/src/server.ts`が存在する
- [ ] `pnpm start`でサーバーが起動する
- [ ] WebSocket接続が機能する

---

## 注意事項

1. **必ず`develop`からブランチを作成**
2. **PRのベースは必ず`develop`**
3. **`packages/mobile-bridge/`以外のディレクトリは編集しない**
4. **各タスク完了後、PRを作成してManusのレビューを待つ**
5. **前のタスクがマージされるまで次のタスクを開始しない**
