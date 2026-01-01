# 再利用可能リソース マッピング

## 概要

Claude-Flow-Xは、既存の2つのプロジェクトから再利用可能なコードを最大限活用します。

| ソース | 用途 |
|:---|:---|
| **Claude-Flow** (ruvnet/claude-flow) | Swarm Layer, Core Layer の基盤 |
| **Claude Code GitHub Actions** (anthropics/claude-code-action) | GitHub Layer の基盤 |

---

## 1. Claude-Flow からの再利用リソース

### 1.1 Core Layer（そのまま再利用可能）

| ファイル | サイズ | 再利用方法 | 変更点 |
|:---|:---:|:---|:---|
| `src/core/event-bus.ts` | 4.5KB | **コピー** | 型定義を`@claude-flow-x/shared`に移動 |
| `src/core/ConfigManager.ts` | 8.5KB | **コピー** | Zodスキーマを追加 |
| `src/core/logger.ts` | 8.4KB | **コピー** | 構造化ログ形式に拡張 |
| `src/core/persistence.ts` | 7.8KB | **コピー** | そのまま使用 |
| `src/core/json-persistence.ts` | 4.6KB | **コピー** | そのまま使用 |

### 1.2 Swarm Layer（そのまま再利用可能）

| ファイル | サイズ | 再利用方法 | 変更点 |
|:---|:---:|:---|:---|
| `src/swarm/coordinator.ts` | 95KB | **コピー** | Event Bus統合 |
| `src/swarm/executor.ts` | 29KB | **コピー** | Event Bus統合 |
| `src/swarm/direct-executor.ts` | 34KB | **コピー** | そのまま使用 |
| `src/swarm/hive-mind-integration.ts` | 31KB | **コピー** | そのまま使用 |
| `src/swarm/claude-code-interface.ts` | 37KB | **コピー** | そのまま使用 |

### 1.3 Agent Layer（そのまま再利用可能）

| ファイル | サイズ | 再利用方法 | 変更点 |
|:---|:---:|:---|:---|
| `src/core/AgentRegistry.ts` | 14.5KB | **コピー** | Event Bus統合 |
| `src/agents/agent-manager.ts` | - | **コピー** | そのまま使用 |
| `src/agents/agent-loader.ts` | - | **コピー** | そのまま使用 |
| `src/cli/agents/*.ts` | - | **コピー** | 54種類のエージェント定義 |

### 1.4 Memory Layer（そのまま再利用可能）

| ファイル | サイズ | 再利用方法 | 変更点 |
|:---|:---:|:---|:---|
| `src/memory/manager.ts` | 15KB | **コピー** | そのまま使用 |
| `src/memory/swarm-memory.ts` | 18KB | **コピー** | そのまま使用 |
| `src/memory/distributed-memory.ts` | 28KB | **コピー** | そのまま使用 |
| `src/memory/cache.ts` | 5KB | **コピー** | そのまま使用 |

### 1.5 Monitoring Layer（そのまま再利用可能）

| ファイル | サイズ | 再利用方法 | 変更点 |
|:---|:---:|:---|:---|
| `src/monitoring/real-time-monitor.ts` | 32KB | **コピー** | WebSocket統合 |
| `src/monitoring/health-check.ts` | 13KB | **コピー** | そのまま使用 |
| `src/monitoring/diagnostics.ts` | 22KB | **コピー** | そのまま使用 |

### 1.6 CLI（参照のみ）

| ファイル | 再利用方法 | 備考 |
|:---|:---|:---|
| `src/cli/commands/*.ts` | **参照** | コマンド構造を参考に |
| `src/cli/init/*.ts` | **参照** | 初期化フローを参考に |

---

## 2. Claude Code GitHub Actions からの再利用リソース

### 2.1 GitHub API Layer（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/github/api/client.ts` | **コピー** | そのまま使用 |
| `src/github/api/config.ts` | **コピー** | そのまま使用 |
| `src/github/api/queries/github.ts` | **コピー** | そのまま使用 |
| `src/github/context.ts` | **コピー** | そのまま使用 |
| `src/github/token.ts` | **コピー** | そのまま使用 |
| `src/github/types.ts` | **コピー** | `@claude-flow-x/shared`に統合 |

### 2.2 GitHub Operations（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/github/operations/branch.ts` | **コピー** | そのまま使用 |
| `src/github/operations/branch-cleanup.ts` | **コピー** | そのまま使用 |
| `src/github/operations/comment-logic.ts` | **コピー** | そのまま使用 |
| `src/github/operations/comments/*.ts` | **コピー** | そのまま使用 |
| `src/github/operations/git-config.ts` | **コピー** | そのまま使用 |

### 2.3 GitHub Validation（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/github/validation/actor.ts` | **コピー** | そのまま使用 |
| `src/github/validation/permissions.ts` | **コピー** | そのまま使用 |
| `src/github/validation/trigger.ts` | **コピー** | Event Bus統合 |

### 2.4 GitHub Data（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/github/data/fetcher.ts` | **コピー** | そのまま使用 |
| `src/github/data/formatter.ts` | **コピー** | そのまま使用 |

### 2.5 Modes（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/modes/agent/index.ts` | **コピー** | Swarm Layer統合 |
| `src/modes/agent/parse-tools.ts` | **コピー** | そのまま使用 |
| `src/modes/detector.ts` | **コピー** | そのまま使用 |
| `src/modes/registry.ts` | **コピー** | そのまま使用 |
| `src/modes/tag/index.ts` | **コピー** | そのまま使用 |

### 2.6 MCP Servers（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/mcp/github-actions-server.ts` | **コピー** | そのまま使用 |
| `src/mcp/github-comment-server.ts` | **コピー** | そのまま使用 |
| `src/mcp/github-file-ops-server.ts` | **コピー** | そのまま使用 |
| `src/mcp/install-mcp-server.ts` | **コピー** | そのまま使用 |

### 2.7 Utilities（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `src/utils/retry.ts` | **コピー** | `@claude-flow-x/shared`に移動 |
| `src/github/utils/sanitizer.ts` | **コピー** | そのまま使用 |
| `src/github/utils/image-downloader.ts` | **コピー** | そのまま使用 |

### 2.8 GitHub Actions Workflow（そのまま再利用可能）

| ファイル | 再利用方法 | 変更点 |
|:---|:---|:---|
| `action.yml` | **コピー** | inputs/outputsを拡張 |
| `.github/workflows/*.yml` | **コピー** | そのまま使用 |

---

## 3. 新規実装が必要なリソース

### 3.1 Core Layer（新規）

| ファイル | 理由 |
|:---|:---|
| `packages/core/src/state/index.ts` | Zustandベースの状態管理（Claude-Flowにはない） |

### 3.2 Mobile Bridge Layer（新規）

| ファイル | 理由 |
|:---|:---|
| `packages/mobile-bridge/src/websocket/` | Remote Cursorから移植 |
| `packages/mobile-bridge/src/push/` | Remote Cursorから移植 |
| `packages/mobile-bridge/src/progress/` | Remote Cursorから移植 |

### 3.3 Mobile App Layer（新規）

| ファイル | 理由 |
|:---|:---|
| `packages/mobile-app/` | Remote Cursorから移植 |

---

## 4. ディレクトリ構造（再利用を反映）

```
claude-flow-x/
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── event-bus/      # ← Claude-Flow src/core/event-bus.ts
│   │       ├── config/         # ← Claude-Flow src/core/ConfigManager.ts
│   │       ├── logger/         # ← Claude-Flow src/core/logger.ts
│   │       ├── persistence/    # ← Claude-Flow src/core/persistence.ts
│   │       └── state/          # ← 新規（Zustand）
│   │
│   ├── shared/
│   │   └── src/types/          # ← 型定義を統合
│   │
│   ├── github/
│   │   └── src/
│   │       ├── api/            # ← Claude Code Action src/github/api/
│   │       ├── operations/     # ← Claude Code Action src/github/operations/
│   │       ├── validation/     # ← Claude Code Action src/github/validation/
│   │       ├── data/           # ← Claude Code Action src/github/data/
│   │       ├── modes/          # ← Claude Code Action src/modes/
│   │       └── mcp/            # ← Claude Code Action src/mcp/
│   │
│   ├── swarm/
│   │   └── src/
│   │       ├── coordinator/    # ← Claude-Flow src/swarm/coordinator.ts
│   │       ├── executor/       # ← Claude-Flow src/swarm/executor.ts
│   │       ├── agents/         # ← Claude-Flow src/cli/agents/
│   │       ├── memory/         # ← Claude-Flow src/memory/
│   │       └── monitoring/     # ← Claude-Flow src/monitoring/
│   │
│   ├── mobile-bridge/
│   │   └── src/
│   │       ├── websocket/      # ← Remote Cursor src/server/websocket/
│   │       ├── push/           # ← Remote Cursor src/server/services/
│   │       └── progress/       # ← Remote Cursor src/server/services/
│   │
│   └── mobile-app/
│       └── src/                # ← Remote Cursor src/mobile/
│
├── action.yml                  # ← Claude Code Action action.yml
└── .github/workflows/          # ← Claude Code Action .github/workflows/
```

---

## 5. 再利用の統計

| ソース | ファイル数 | 推定コード行数 | 再利用率 |
|:---|:---:|:---:|:---:|
| Claude-Flow | ~50 | ~15,000 | 80% |
| Claude Code GitHub Actions | ~40 | ~8,000 | 90% |
| Remote Cursor | ~20 | ~3,000 | 95% |
| **新規実装** | ~10 | ~2,000 | - |

**合計**: 約28,000行のコードのうち、約85%を再利用可能

---

## 6. CC別の再利用タスク

### CC-1: Core Layer

| タスク | 再利用元 | 作業内容 |
|:---|:---|:---|
| TASK-002 | Claude-Flow `event-bus.ts` | コピー＋型定義分離 |
| TASK-004 | Claude-Flow `ConfigManager.ts` | コピー＋Zod追加 |
| TASK-005 | Claude-Flow `logger.ts` | コピー＋構造化ログ拡張 |

### CC-2: GitHub Layer

| タスク | 再利用元 | 作業内容 |
|:---|:---|:---|
| TASK-012 | Claude Code Action `validation/trigger.ts` | コピー＋Event Bus統合 |
| TASK-013 | Claude Code Action `operations/comments/` | コピー |
| TASK-014 | Claude Code Action `operations/branch.ts` | コピー |

### CC-3: Swarm Layer

| タスク | 再利用元 | 作業内容 |
|:---|:---|:---|
| TASK-022 | Claude-Flow `AgentRegistry.ts` | コピー＋Event Bus統合 |
| TASK-023 | Claude-Flow `coordinator.ts` | コピー＋Event Bus統合 |
| TASK-024 | Claude-Flow `memory/` | コピー |

### CC-4: Mobile Bridge

| タスク | 再利用元 | 作業内容 |
|:---|:---|:---|
| TASK-032 | Remote Cursor `websocket/` | コピー＋Event Bus統合 |
| TASK-033 | Remote Cursor `pushNotificationService.ts` | コピー |
| TASK-034 | Remote Cursor `progressParser.ts` | コピー |

### CC-5: Mobile App

| タスク | 再利用元 | 作業内容 |
|:---|:---|:---|
| TASK-042-047 | Remote Cursor `src/mobile/` | コピー＋テーマ統一 |
