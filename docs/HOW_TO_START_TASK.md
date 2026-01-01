# タスクの進め方

このドキュメントは、Claude Code（CC）にタスクを渡す際の手順を説明します。

---

## CCへの初回タスク指示

### CC-1（Core Layer）への指示

```
以下のリポジトリをクローンして、タスクを実行してください。

リポジトリ: https://github.com/Tohoso/claude-flow-x
ベースブランチ: develop

タスクキュー: docs/tasks/CC1-TASK-QUEUE.md

上記のタスクキューを読み、TASK-001から順番に実行してください。
各タスク完了後、PRを作成してください。PRのベースは必ず develop にしてください。

ブランチ運用ルール: docs/BRANCH_RULES.md
```

### CC-2（GitHub Layer）への指示

```
以下のリポジトリをクローンして、タスクを実行してください。

リポジトリ: https://github.com/Tohoso/claude-flow-x
ベースブランチ: develop

タスクキュー: docs/tasks/CC2-TASK-QUEUE.md

上記のタスクキューを読み、TASK-010から順番に実行してください。
ただし、TASK-010はTASK-001（CC-1）がマージされた後に開始してください。
各タスク完了後、PRを作成してください。PRのベースは必ず develop にしてください。

ブランチ運用ルール: docs/BRANCH_RULES.md

また、移植元のコードは以下にあります:
/home/ubuntu/claude-code-action/
```

### CC-3（Swarm Layer）への指示

```
以下のリポジトリをクローンして、タスクを実行してください。

リポジトリ: https://github.com/Tohoso/claude-flow-x
ベースブランチ: develop

タスクキュー: docs/tasks/CC3-TASK-QUEUE.md

上記のタスクキューを読み、TASK-020から順番に実行してください。
ただし、TASK-020はTASK-001（CC-1）がマージされた後に開始してください。
各タスク完了後、PRを作成してください。PRのベースは必ず develop にしてください。

ブランチ運用ルール: docs/BRANCH_RULES.md

また、移植元のコードは以下にあります:
/home/ubuntu/claude-flow/
```

### CC-4（Mobile Bridge Layer）への指示

```
以下のリポジトリをクローンして、タスクを実行してください。

リポジトリ: https://github.com/Tohoso/claude-flow-x
ベースブランチ: develop

タスクキュー: docs/tasks/CC4-TASK-QUEUE.md

上記のタスクキューを読み、TASK-030から順番に実行してください。
ただし、TASK-030はTASK-001（CC-1）がマージされた後に開始してください。
各タスク完了後、PRを作成してください。PRのベースは必ず develop にしてください。

ブランチ運用ルール: docs/BRANCH_RULES.md

また、移植元のコードは以下にあります:
/home/ubuntu/remote-cursor/src/server/
```

### CC-5（Mobile App Layer）への指示

```
以下のリポジトリをクローンして、タスクを実行してください。

リポジトリ: https://github.com/Tohoso/claude-flow-x
ベースブランチ: develop

タスクキュー: docs/tasks/CC5-TASK-QUEUE.md

上記のタスクキューを読み、TASK-040から順番に実行してください。
ただし、TASK-040はTASK-001（CC-1）がマージされた後に開始してください。
各タスク完了後、PRを作成してください。PRのベースは必ず develop にしてください。

ブランチ運用ルール: docs/BRANCH_RULES.md

また、移植元のコードは以下にあります:
/home/ubuntu/remote-cursor/src/mobile/
```

---

## タスク継続の指示

PRがマージされた後、CCに次のタスクを続行させる場合：

```
PRがマージされました。次のタスクに進んでください。

1. developブランチを最新に更新してください
   git checkout develop
   git pull origin develop

2. タスクキュー（docs/tasks/CC{N}-TASK-QUEUE.md）の次のタスクを実行してください

3. 完了したらPRを作成してください（ベース: develop）
```

---

## 並列実行のタイミング

### Phase 1: 基盤構築（TASK-001が前提）

```
TASK-001 (CC-1) ─────────────────────────────────────────────────────────────
                 │
                 ├─→ TASK-010 (CC-2) ─→ TASK-011 ─→ TASK-012
                 │
                 ├─→ TASK-020 (CC-3) ─→ TASK-021 ─→ TASK-022
                 │
                 ├─→ TASK-030 (CC-4) ─→ TASK-031 ─→ TASK-032 ─→ TASK-033
                 │
                 └─→ TASK-040 (CC-5) ─→ TASK-041 ─→ TASK-042 ─→ TASK-043 ─→ TASK-044
```

### 開始タイミング

| タイミング | 開始可能なCC |
|:---|:---|
| 最初 | CC-1のみ（TASK-001） |
| TASK-001マージ後 | CC-2, CC-3, CC-4, CC-5（並列） |
| TASK-002マージ後 | Event Bus統合タスク（TASK-012, 022, 032） |

---

## PRレビュー後の対応

### 修正が必要な場合

CCに以下のように指示：

```
PRにコメントがあります。以下の修正を行ってください：

[修正内容を記載]

修正後、同じブランチにプッシュしてください。
```

### マージ可能な場合

1. ManusがPRをマージ
2. CCに次のタスクを指示（上記「タスク継続の指示」参照）

---

## トラブルシューティング

### コンフリクトが発生した場合

CCに以下のように指示：

```
コンフリクトが発生しています。以下の手順で解決してください：

1. developを最新に更新
   git checkout develop
   git pull origin develop

2. 作業ブランチにマージ
   git checkout [ブランチ名]
   git merge develop

3. コンフリクトを解決してコミット
   git add .
   git commit -m "merge: resolve conflicts with develop"
   git push origin [ブランチ名]
```

### ビルドエラーが発生した場合

CCに以下のように指示：

```
ビルドエラーが発生しています。以下を確認してください：

1. 依存関係が正しくインストールされているか
   pnpm install

2. TypeScriptエラーがないか
   pnpm build

3. エラーメッセージを確認して修正してください
```

---

## progress.md の更新ルール

各CCは自分のタスクのみ更新：

```markdown
| TASK-001 | core | Monorepo構造の作成 | ✅ Done | CC-1 |
| TASK-002 | core | Event Busの実装 | 🟡 In Progress | CC-1 |
```

ステータス：
- `⚪ Ready` - 未着手
- `🟡 In Progress` - 作業中
- `✅ Done` - 完了
- `🔴 Blocked` - ブロック中
