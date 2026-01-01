# 並列開発ガイド

## 1. 概要

Claude-Flow-Xは、5台のClaude Code（CC）を使用して並列開発を行います。各CCは特定のレイヤー/パッケージを担当し、コンフリクトを最小化しながら効率的に開発を進めます。

## 2. CC役割分担

| CC | 担当 | パッケージ | 主な責務 |
|:---|:---|:---|:---|
| **CC-1** | Core Layer | `packages/core/` | Event Bus, State Manager, Config Manager |
| **CC-2** | GitHub Layer | `packages/github/` | @claudeメンション, トラッキング, PR統合 |
| **CC-3** | Swarm Layer | `packages/swarm/` | エージェント, コーディネーター, メモリ |
| **CC-4** | Mobile Bridge | `packages/mobile-bridge/` | WebSocket Server, Push Notification |
| **CC-5** | Mobile App | `packages/mobile-app/` | React Native UI, 画面実装 |

## 3. ディレクトリ所有権

各CCは以下のディレクトリに対する排他的な編集権限を持ちます。

```
packages/
├── core/               # CC-1 専用
│   ├── src/
│   │   ├── event-bus/
│   │   ├── state/
│   │   └── config/
│   └── package.json
├── github/             # CC-2 専用
│   ├── src/
│   │   ├── triggers/
│   │   ├── tracking/
│   │   └── actions/
│   └── package.json
├── swarm/              # CC-3 専用
│   ├── src/
│   │   ├── agents/
│   │   ├── coordinator/
│   │   └── memory/
│   └── package.json
├── mobile-bridge/      # CC-4 専用
│   ├── src/
│   │   ├── websocket/
│   │   └── push/
│   └── package.json
└── mobile-app/         # CC-5 専用
    ├── app/
    ├── components/
    └── package.json
```

### 共有ディレクトリ（編集時は調整が必要）

| ディレクトリ | 編集可能なCC | 備考 |
|:---|:---|:---|
| `packages/shared/types/` | 全CC | 型定義の追加のみ、削除・変更は要調整 |
| `docs/` | 全CC | 自分の担当領域のドキュメントのみ |
| `progress.md` | 全CC | 自分のタスク進捗のみ更新 |

## 4. ブランチ戦略

### ブランチ命名規則

```
feature/<layer>/<task-id>-<description>
```

例：
- `feature/core/TASK-001-event-bus`
- `feature/github/TASK-010-mention-trigger`
- `feature/swarm/TASK-020-agent-registry`
- `feature/mobile-bridge/TASK-030-websocket-server`
- `feature/mobile-app/TASK-040-dashboard-screen`

### ブランチフロー

```
main
  │
  └── develop
        │
        ├── feature/core/TASK-001-event-bus        (CC-1)
        ├── feature/github/TASK-010-mention-trigger (CC-2)
        ├── feature/swarm/TASK-020-agent-registry   (CC-3)
        ├── feature/mobile-bridge/TASK-030-ws       (CC-4)
        └── feature/mobile-app/TASK-040-dashboard   (CC-5)
```

## 5. コミュニケーションプロトコル

### 5.1 progress.md による進捗共有

各CCは `progress.md` を更新して進捗を共有します。

```markdown
## Current Sprint

### CC-1 (Core Layer)
| Task | Status | Progress |
|:---|:---|:---|
| TASK-001 | 🟡 In Progress | 60% |

### CC-2 (GitHub Layer)
| Task | Status | Progress |
|:---|:---|:---|
| TASK-010 | ⚪ Ready | 0% |
```

### 5.2 依存関係の通知

他のCCの成果物に依存する場合は、`progress.md` の Blockers セクションに記載します。

```markdown
## Blockers

| ID | Blocked Task | Waiting For | Owner |
|:---|:---|:---|:---|
| BLK-001 | TASK-010 | TASK-001 (Event Bus) | CC-1 |
```

### 5.3 インターフェース契約

パッケージ間のインターフェースは `packages/shared/types/` で定義します。

```typescript
// packages/shared/types/events.ts
export interface TaskStartedEvent {
  type: 'task_started';
  payload: {
    taskId: string;
    agentId: string;
  };
}
```

## 6. PRルール

### 6.1 PRの作成

- 1つのタスクにつき1つのPR
- PRタイトル: `feat(<layer>): <description> (TASK-XXX)`
- ベースブランチ: `develop`

### 6.2 レビュー

- Manus（人間）がレビューとマージを担当
- 自動テストがパスしていること
- コンフリクトがないこと

### 6.3 マージ後

- `develop` から自分のブランチに最新を取り込む
- `progress.md` のタスクステータスを更新

## 7. 依存関係マップ

```
CC-1 (Core)
    │
    ├──→ CC-2 (GitHub)      # Event Bus, State を使用
    ├──→ CC-3 (Swarm)       # Event Bus, State, Config を使用
    ├──→ CC-4 (Mobile Bridge) # Event Bus, State を使用
    │
CC-4 (Mobile Bridge)
    │
    └──→ CC-5 (Mobile App)  # WebSocket API を使用
```

### 推奨開発順序

1. **Week 1-2**: CC-1 が Core Layer の基盤を構築
2. **Week 2-3**: CC-2, CC-3, CC-4 が並行して各レイヤーを開発
3. **Week 3-4**: CC-5 が Mobile App を開発（CC-4 の成果物に依存）

## 8. コンフリクト解決

### 8.1 予防策

- 各CCは自分の所有ディレクトリのみを編集
- 共有ファイルの編集は最小限に
- 型定義の追加は `packages/shared/types/` に新規ファイルで

### 8.2 発生時の対応

1. Manusに報告
2. Manusがコンフリクトを解決
3. 解決後、各CCは `develop` から最新を取り込む

## 9. 品質基準

### 9.1 コード品質

- TypeScript strict mode
- ESLint エラーなし
- Prettier フォーマット済み

### 9.2 テスト

- ユニットテストカバレッジ 80%以上
- 統合テストがパス

### 9.3 ドキュメント

- 公開APIにはJSDocコメント
- READMEに使用方法を記載
