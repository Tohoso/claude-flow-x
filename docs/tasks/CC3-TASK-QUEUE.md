# CC-3 タスクキュー

> **担当レイヤー**: Swarm Layer
> **ディレクトリ所有権**: `packages/swarm/`
> **ブランチプレフィックス**: `feature/swarm/`
> **ベースブランチ**: `develop`

---

## タスク実行順序

以下のタスクを順番に実行してください。各タスク完了後、PRを作成してManusのレビューを待ってください。

---

### TASK-020: パッケージ初期化とコード移植

**前提条件**: TASK-001（CC-1）がマージされていること

**ブランチ**: `feature/swarm/task-020-package-init`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/swarm/task-020-package-init
```

2. packages/swarm/package.jsonを作成
```bash
mkdir -p packages/swarm/src
cat > packages/swarm/package.json << 'EOF'
{
  "name": "@claude-flow-x/swarm",
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
    "@claude-flow-x/core": "workspace:*",
    "@claude-flow-x/shared": "workspace:*"
  }
}
EOF
```

3. 既存コードを一括コピー（リポジトリ内の_upstreamから）
```bash
# Swarmコア
mkdir -p packages/swarm/src/coordinator
cp _upstream/claude-flow/swarm/coordinator.ts packages/swarm/src/coordinator/index.ts

mkdir -p packages/swarm/src/executor
cp _upstream/claude-flow/swarm/executor.ts packages/swarm/src/executor/index.ts
cp _upstream/claude-flow/swarm/direct-executor.ts packages/swarm/src/executor/direct.ts

mkdir -p packages/swarm/src/hive-mind
cp _upstream/claude-flow/swarm/hive-mind-integration.ts packages/swarm/src/hive-mind/index.ts

mkdir -p packages/swarm/src/claude-code
cp _upstream/claude-flow/swarm/claude-code-interface.ts packages/swarm/src/claude-code/index.ts

# Agent Registry
mkdir -p packages/swarm/src/agents/definitions
cp _upstream/claude-flow/core/AgentRegistry.ts packages/swarm/src/agents/registry.ts
cp _upstream/claude-flow/agents/agent-manager.ts packages/swarm/src/agents/manager.ts
cp _upstream/claude-flow/agents/agent-loader.ts packages/swarm/src/agents/loader.ts
cp -r _upstream/claude-flow/cli/agents/* packages/swarm/src/agents/definitions/

# Memory
mkdir -p packages/swarm/src/memory
cp _upstream/claude-flow/memory/manager.ts packages/swarm/src/memory/manager.ts
cp _upstream/claude-flow/memory/swarm-memory.ts packages/swarm/src/memory/swarm.ts
cp _upstream/claude-flow/memory/distributed-memory.ts packages/swarm/src/memory/distributed.ts
cp _upstream/claude-flow/memory/cache.ts packages/swarm/src/memory/cache.ts

# Monitoring
mkdir -p packages/swarm/src/monitoring
cp _upstream/claude-flow/monitoring/real-time-monitor.ts packages/swarm/src/monitoring/index.ts
cp _upstream/claude-flow/monitoring/health-check.ts packages/swarm/src/monitoring/health.ts
cp _upstream/claude-flow/monitoring/diagnostics.ts packages/swarm/src/monitoring/diagnostics.ts
```

4. packages/swarm/tsup.config.tsを作成
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
```

5. packages/swarm/src/index.tsを作成
```typescript
export * from './coordinator';
export * from './executor';
export * from './agents';
export * from './memory';
export * from './monitoring';
```

6. progress.mdを更新

7. PRを作成
```bash
git add .
git commit -m "feat(swarm): Initialize package and migrate Claude-Flow code"
git push origin feature/swarm/task-020-package-init
gh pr create --base develop --title "feat(swarm): Initialize package and migrate code (TASK-020)" --body "..."
```

**完了条件**:
- [ ] `packages/swarm/package.json`が存在する
- [ ] 全てのコードが移植されている
- [ ] `pnpm install`が成功する

---

### TASK-021: importパス修正とビルド確認

**前提条件**: TASK-020がマージされていること

**ブランチ**: `feature/swarm/task-021-fix-imports`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/swarm/task-021-fix-imports
```

2. 各ファイルのimportパスを修正
   - 相対パスに変更
   - 外部依存関係を特定してpackage.jsonに追加

3. TypeScriptエラーを修正

4. ビルドを確認
```bash
cd packages/swarm
pnpm build
```

5. progress.mdを更新

6. PRを作成

**完了条件**:
- [ ] 全てのimportパスが修正されている
- [ ] `pnpm build`が成功する
- [ ] TypeScriptエラーがない

---

### TASK-022: Event Bus統合

**前提条件**: TASK-021がマージされていること、TASK-002（CC-1）がマージされていること

**ブランチ**: `feature/swarm/task-022-event-bus-integration`

**作業内容**:

1. developを最新に更新
2. Event Busをインポート
```typescript
import { eventBus } from '@claude-flow-x/core';
```

3. 各モジュールでEvent Busイベントを発行
```typescript
// エージェントイベント
eventBus.emit('swarm:agent_spawned', { ... });
eventBus.emit('swarm:agent_terminated', { ... });

// タスクイベント
eventBus.emit('swarm:task_started', { ... });
eventBus.emit('swarm:task_completed', { ... });
eventBus.emit('swarm:task_failed', { ... });

// ブロッカーイベント
eventBus.emit('swarm:blocker_detected', { ... });
eventBus.emit('swarm:blocker_resolved', { ... });
```

4. progress.mdを更新

5. PRを作成

**完了条件**:
- [ ] Event Busと連携している
- [ ] 適切なイベントが発行される
- [ ] テストが通る

---

## 注意事項

1. **必ず`develop`からブランチを作成**
2. **PRのベースは必ず`develop`**
3. **`packages/swarm/`以外のディレクトリは編集しない**
4. **各タスク完了後、PRを作成してManusのレビューを待つ**
5. **前のタスクがマージされるまで次のタスクを開始しない**
6. **再利用コードは`_upstream/`ディレクトリにあります**
