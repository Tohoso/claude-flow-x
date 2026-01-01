# ブランチ運用ルール

## 基本ルール

| 項目 | 値 |
|:---|:---|
| **ベースブランチ** | `develop` |
| **PRのマージ先** | `develop` |
| **本番リリース用** | `main`（Manusが管理） |

---

## ブランチ命名規則

```
feature/{layer}/{task-id}-{description}
```

### 例

| CC | ブランチ名 |
|:---|:---|
| CC-1 | `feature/core/task-001-monorepo-setup` |
| CC-2 | `feature/github/task-010-package-init` |
| CC-3 | `feature/swarm/task-020-code-migration` |
| CC-4 | `feature/mobile-bridge/task-030-package-init` |
| CC-5 | `feature/mobile-app/task-040-expo-init` |

---

## 作業フロー

### 1. ブランチ作成

```bash
# 必ずdevelopから作成
git checkout develop
git pull origin develop
git checkout -b feature/{layer}/{task-id}-{description}
```

### 2. 作業とコミット

```bash
# 作業を実施
# ...

# コミット
git add .
git commit -m "feat: {description}"
```

### 3. プッシュ

```bash
# 自分のブランチにプッシュ
git push origin feature/{layer}/{task-id}-{description}
```

### 4. PR作成

```bash
# PRを作成（ベース: develop）
gh pr create --base develop --title "feat: {description}" --body "..."
```

---

## 禁止事項

1. **`main`ブランチへの直接プッシュ禁止**
2. **`develop`ブランチへの直接プッシュ禁止**
3. **他のCCのディレクトリを編集禁止**
4. **PRのベースを`main`にしない**

---

## ディレクトリ所有権

| CC | 所有ディレクトリ | 編集禁止ディレクトリ |
|:---|:---|:---|
| CC-1 | `packages/core/`, `packages/shared/` | 他の全て |
| CC-2 | `packages/github/` | 他の全て |
| CC-3 | `packages/swarm/` | 他の全て |
| CC-4 | `packages/mobile-bridge/` | 他の全て |
| CC-5 | `packages/mobile-app/` | 他の全て |

### 共有ファイル

以下のファイルは全CCが更新可能：

- `progress.md`（自分のタスクのみ）
- `pnpm-workspace.yaml`（自分のパッケージ追加のみ）

---

## コンフリクト解決

コンフリクトが発生した場合：

1. `develop`を最新に更新
```bash
git checkout develop
git pull origin develop
```

2. 作業ブランチにマージ
```bash
git checkout feature/{layer}/{task-id}-{description}
git merge develop
```

3. コンフリクトを解決してコミット
```bash
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin feature/{layer}/{task-id}-{description}
```

---

## PR承認フロー

1. CCがPRを作成
2. Manusがレビュー
3. Manusが`develop`にマージ
4. 次のタスクへ進む
