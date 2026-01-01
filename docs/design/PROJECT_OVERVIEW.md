# Claude-Flow-X プロジェクト概要

## 1. プロジェクトの目的

Claude-Flow-Xは、以下の3つのプロジェクトを統合した**オープンソースのAIエージェントオーケストレーションプラットフォーム**です。

| 統合元 | 提供機能 |
|:---|:---|
| **Claude-Flow** | マルチエージェントスウォーム、リアルタイム監視、AgentDB |
| **Claude Code GitHub Actions** | @claudeメンション、トラッキングコメント、PR統合 |
| **Remote Cursor** | モバイルアプリUI、プッシュ通知、WebSocketリアルタイム配信 |

## 2. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Claude-Flow-X                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   GitHub Layer  │  │   Swarm Layer   │  │  Mobile Layer   │             │
│  │  (@claude等)    │  │ (エージェント)  │  │ (モバイルアプリ)│             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│                    ┌───────────▼───────────┐                               │
│                    │    Core Orchestrator   │                               │
│                    │  (Event Bus + State)   │                               │
│                    └───────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. 主要コンポーネント

### 3.1 Core Layer（新規）
- **Event Bus**: 各レイヤー間の疎結合な通信
- **State Manager**: Zustandベースの中央集権的状態管理
- **Config Manager**: cosmiconfigベースの階層的設定管理

### 3.2 GitHub Layer（Claude Code GitHub Actionsから移植）
- **Mention Trigger**: `@claude`メンションでエージェント起動
- **Tracking Comment**: PRに進捗チェックボックスを投稿
- **PR Actions**: PR作成、レビュー、マージの自動化

### 3.3 Swarm Layer（Claude-Flowから継承）
- **Agent Registry**: 54種類以上のエージェント定義
- **Coordinator**: タスクの分散と調整
- **Memory System**: AgentDBによる永続メモリ

### 3.4 Mobile Layer（Remote Cursorから移植）
- **WebSocket Server**: リアルタイムイベント配信
- **Push Notification**: Expo Push Notificationsによる通知
- **Mobile App**: React Nativeダッシュボードアプリ

## 4. 技術スタック

| カテゴリ | 技術 |
|:---|:---|
| 言語 | TypeScript 5.x |
| ランタイム | Node.js 20+ |
| パッケージ管理 | pnpm (monorepo) |
| ビルド | tsup |
| テスト | Vitest |
| 状態管理 | Zustand |
| 設定管理 | cosmiconfig + zod |
| モバイル | React Native (Expo) |

## 5. ディレクトリ構造

```
claude-flow-x/
├── packages/
│   ├── core/           # Core Layer (Event Bus, State, Config)
│   ├── github/         # GitHub Layer
│   ├── swarm/          # Swarm Layer (既存Claude-Flowから)
│   ├── mobile-bridge/  # Mobile Bridge (WebSocket, Push)
│   └── mobile-app/     # React Native App
├── docs/
│   ├── architecture/   # アーキテクチャ設計書
│   ├── design/         # 詳細設計書
│   ├── tasks/          # タスク定義
│   └── guides/         # 開発ガイド
├── .github/
│   └── workflows/      # CI/CD
└── progress.md         # 進捗管理ファイル
```

## 6. 開発フェーズ

| Phase | 期間 | 内容 |
|:---|:---|:---|
| Phase 1 | 2週間 | 基盤統合（Core Layer、monorepo化） |
| Phase 2 | 2週間 | GitHub Layer統合 |
| Phase 3 | 2週間 | Mobile Layer統合 |
| Phase 4 | 1週間 | 統合テスト、ドキュメント |

## 7. 並列開発体制

5台のClaude Code（CC）を使用して並列開発を行います。

| CC | 担当レイヤー | ディレクトリ所有権 |
|:---|:---|:---|
| CC-1 | Core Layer | `packages/core/` |
| CC-2 | GitHub Layer | `packages/github/` |
| CC-3 | Swarm Layer | `packages/swarm/` |
| CC-4 | Mobile Bridge | `packages/mobile-bridge/` |
| CC-5 | Mobile App | `packages/mobile-app/` |

詳細は `docs/design/PARALLEL_DEVELOPMENT.md` を参照してください。
