# CC-3 Phase 1 タスク指示書

> **重要**: このタスクでは既存のClaude-Flowコードを最大限再利用します。
> 再利用元: `_upstream/claude-flow/` (フォーク元リポジトリ)

## 担当者情報

| 項目 | 値 |
|:---|:---|
| 担当CC | CC-3 |
| 担当レイヤー | Swarm Layer |
| ディレクトリ所有権 | `packages/swarm/` |
| ブランチプレフィックス | `feature/swarm/` |

---

## 概要

CC-3は、Swarm Layerを担当します。既存のClaude-Flowのコードを整理し、新しいCore Layer（Event Bus, State Manager）との統合計画を作成します。

---

## タスク一覧

### TASK-020: 既存コードの移植

**目的**: Claude-Flowの既存コードをSwarm Layerに移植する

**再利用元**: `claude-flow/src/swarm/`, `claude-flow/src/memory/`, `claude-flow/src/monitoring/`

**作業内容**:

1. 既存ファイルを一括コピー
```bash
# Swarmコア
mkdir -p packages/swarm/src/coordinator
cp _upstream/claude-flow/swarm/coordinator.ts packages/swarm/src/coordinator/index.ts
cp _upstream/claude-flow/swarm/executor.ts packages/swarm/src/executor/index.ts
cp _upstream/claude-flow/swarm/direct-executor.ts packages/swarm/src/executor/direct.ts
cp _upstream/claude-flow/swarm/hive-mind-integration.ts packages/swarm/src/hive-mind/index.ts
cp _upstream/claude-flow/swarm/claude-code-interface.ts packages/swarm/src/claude-code/index.ts

# Agent Registry
mkdir -p packages/swarm/src/agents
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

2. 移植後のディレクトリ構造
```
packages/swarm/
├── src/
│   ├── coordinator/   # ← claude-flow/src/swarm/coordinator.ts (95KB)
│   ├── executor/      # ← claude-flow/src/swarm/executor.ts (29KB)
│   ├── hive-mind/     # ← claude-flow/src/swarm/hive-mind-integration.ts (31KB)
│   ├── claude-code/   # ← claude-flow/src/swarm/claude-code-interface.ts (37KB)
│   ├── agents/        # ← claude-flow/src/core/AgentRegistry.ts + src/agents/
│   │   ├── registry.ts
│   │   ├── manager.ts
│   │   ├── loader.ts
│   │   └── definitions/  # 54種類のエージェント
│   ├── memory/        # ← claude-flow/src/memory/
│   └── monitoring/    # ← claude-flow/src/monitoring/
└── package.json
```

3. 元の作業内容（分析）:
   Claude-Flow（`_upstream/claude-flow/`）のコードを分析

2. Swarm Layer として切り出す機能を特定
   - `src/swarm/`: スウォーム管理
   - `src/agents/`: エージェント定義
   - `src/coordinator/`: タスク調整
   - `src/memory/`: メモリシステム

3. `packages/swarm/`ディレクトリを作成
```
packages/swarm/
├── src/
│   ├── index.ts
│   ├── agents/
│   │   ├── index.ts
│   │   └── registry.ts
│   ├── coordinator/
│   │   └── index.ts
│   ├── executor/
│   │   └── index.ts
│   └── memory/
│       └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

4. `packages/swarm/package.json`を作成
```json
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
```

5. 既存コードの依存関係を分析し、ドキュメント化
```markdown
# Swarm Layer 既存コード分析

## 移行対象ファイル

| 元ファイル | 移行先 | 変更点 |
|:---|:---|:---|
| src/swarm/coordinator.ts | packages/swarm/src/coordinator/ | Event Bus統合 |
| src/agents/*.ts | packages/swarm/src/agents/ | 型定義分離 |
| ... | ... | ... |

## 依存関係

- 外部ライブラリ: ...
- 内部モジュール: ...

## 破壊的変更

- ...
```

**完了条件**:
- [ ] `packages/swarm/`ディレクトリが作成されている
- [ ] 既存コードの分析ドキュメントが作成されている
- [ ] 移行対象ファイルが特定されている

**ブランチ**: `feature/swarm/task-020-code-analysis`

---

### TASK-021: Event Bus統合計画

**目的**: 既存のSwarmコードをCore LayerのEvent Busと統合する計画を作成する

**前提条件**: TASK-002（Event Bus）が完了していること

**作業内容**:

1. 既存のSwarmコードで発行されるイベントを特定

2. Event Busイベントへのマッピングを作成
```markdown
# Swarm Layer Event Bus 統合計画

## 既存イベント → 新イベント マッピング

| 既存 | 新Event Bus | 備考 |
|:---|:---|:---|
| agent.spawn | swarm:agent_spawned | ペイロード形式変更 |
| task.start | swarm:task_started | - |
| task.complete | swarm:task_completed | result構造変更 |
| ... | ... | ... |

## 統合手順

1. Event Bus購読の追加
2. 既存イベント発行をEvent Bus.emit()に置換
3. 既存イベントリスナーをEvent Bus.on()に置換
4. テスト更新
```

3. Phase 2のタスク分割を作成
```markdown
## Phase 2 タスク分割案

| Task ID | 機能 | 見積もり |
|:---|:---|:---|
| TASK-022 | Agent Registry移行 | 8h |
| TASK-023 | Coordinator移行 | 8h |
| TASK-024 | Memory System移行 | 6h |
| TASK-025 | GitHub Event Handler | 6h |
```

4. `docs/design/SWARM_LAYER_DESIGN.md`を作成

**完了条件**:
- [ ] イベントマッピングが完了している
- [ ] 統合手順が文書化されている
- [ ] Phase 2のタスク分割が完了している

**ブランチ**: `feature/swarm/task-021-event-bus-plan`

---

## 参考資料

### Claude-Flow の Swarm 関連コード

```
claude-flow/src/
├── swarm/
│   ├── coordinator.ts      # タスク調整
│   ├── executor.ts         # タスク実行
│   └── topology.ts         # トポロジー管理
├── agents/
│   ├── registry.ts         # エージェント登録
│   ├── types.ts            # エージェント型定義
│   └── definitions/        # 54種類のエージェント定義
├── memory/
│   ├── agentdb.ts          # AgentDB
│   └── vector-store.ts     # ベクトルストア
└── monitoring/
    └── real-time-monitor.ts # リアルタイム監視
```

### 主要な統合ポイント

1. **Coordinator**: タスクの分散と調整
   - Event Busでタスク割り当てを通知
   - State Managerでタスク状態を管理

2. **Agent Registry**: エージェントの管理
   - Event Busでエージェント起動/終了を通知
   - State Managerでエージェント状態を管理

3. **Memory System**: 永続メモリ
   - AgentDBの統合
   - State Managerとの同期

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
- Phase 1では実装は行わず、分析と計画のみ
- 既存のClaude-Flowコードは参照のみ、直接編集しない
