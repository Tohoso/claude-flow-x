# CC-2 Phase 1 タスク指示書

## 担当者情報

| 項目 | 値 |
|:---|:---|
| 担当CC | CC-2 |
| 担当レイヤー | GitHub Layer |
| ディレクトリ所有権 | `packages/github/` |
| ブランチプレフィックス | `feature/github/` |

---

## 概要

CC-2は、GitHub Layerを担当します。Phase 1では、パッケージの初期化とClaude Code GitHub Actionsからの移植計画を作成します。

---

## タスク一覧

### TASK-010: パッケージ初期化

**目的**: GitHub Layerのパッケージ構造を作成する

**前提条件**: TASK-001（monorepo構造）が完了していること

**作業内容**:

1. `packages/github/`ディレクトリを作成
```
packages/github/
├── src/
│   ├── index.ts
│   ├── triggers/
│   │   └── index.ts
│   ├── tracking/
│   │   └── index.ts
│   └── actions/
│       └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

2. `packages/github/package.json`を作成
```json
{
  "name": "@claude-flow-x/github",
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
    "@claude-flow-x/shared": "workspace:*",
    "@octokit/rest": "^20.0.0",
    "@octokit/webhooks": "^12.0.0"
  }
}
```

3. `packages/github/src/index.ts`を作成
```typescript
// GitHub Layer entry point
export * from './triggers';
export * from './tracking';
export * from './actions';
```

4. 各サブモジュールのプレースホルダーを作成
```typescript
// packages/github/src/triggers/index.ts
export function setupTriggers() {
  // TODO: Implement in Phase 2
}

// packages/github/src/tracking/index.ts
export function setupTracking() {
  // TODO: Implement in Phase 2
}

// packages/github/src/actions/index.ts
export function setupActions() {
  // TODO: Implement in Phase 2
}
```

**完了条件**:
- [ ] `packages/github/`ディレクトリが作成されている
- [ ] `pnpm build`が成功する
- [ ] 他のパッケージから`@claude-flow-x/github`をインポートできる

**ブランチ**: `feature/github/task-010-package-init`

---

### TASK-011: GitHub Actions移植計画

**目的**: Claude Code GitHub Actionsから移植する機能を分析し、計画を作成する

**作業内容**:

1. Claude Code GitHub Actions（`/home/ubuntu/claude-code-action/`）のコードを分析

2. 移植対象の機能を特定
   - `src/triggers/`: メンショントリガー
   - `src/modes/`: 実行モード（agent, one-shot, iterate等）
   - `src/tracking/`: トラッキングコメント
   - `src/github/`: GitHub API操作

3. 移植計画書を作成
```markdown
# GitHub Actions 移植計画書

## 移植対象機能

### 1. Triggers
- [ ] @claude メンション検出
- [ ] PR opened イベント
- [ ] PR synchronize イベント
- [ ] Review submitted イベント

### 2. Modes
- [ ] Agent mode
- [ ] One-shot mode
- [ ] Iterate mode

### 3. Tracking
- [ ] トラッキングコメント投稿
- [ ] チェックボックス更新
- [ ] 進捗表示

### 4. Actions
- [ ] PR作成
- [ ] コミット署名
- [ ] ブランチ操作

## 依存関係

- @octokit/rest
- @octokit/webhooks
- @claude-flow-x/core (Event Bus)

## Phase 2 タスク分割案

| Task ID | 機能 | 見積もり |
|:---|:---|:---|
| TASK-012 | Mention Trigger | 8h |
| TASK-013 | Tracking Comment | 8h |
| TASK-014 | PR Actions | 8h |
| TASK-015 | Review Handler | 6h |
| TASK-016 | GitHub Actions Workflow | 4h |
```

4. `docs/design/GITHUB_LAYER_DESIGN.md`を作成

**完了条件**:
- [ ] 移植対象機能が特定されている
- [ ] Phase 2のタスク分割が完了している
- [ ] 設計ドキュメントが作成されている

**ブランチ**: `feature/github/task-011-migration-plan`

---

## 参考資料

### Claude Code GitHub Actions のコード構造

```
claude-code-action/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── modes/
│   │   ├── detector.ts       # モード検出
│   │   ├── agent/            # エージェントモード
│   │   ├── one-shot/         # ワンショットモード
│   │   └── iterate/          # イテレートモード
│   ├── triggers/
│   │   └── index.ts          # トリガー処理
│   ├── tracking/
│   │   └── index.ts          # トラッキングコメント
│   └── github/
│       └── index.ts          # GitHub API操作
├── action.yml                # GitHub Actions定義
└── package.json
```

### 主要な移植ポイント

1. **Mention Detection**: `src/triggers/index.ts`
   - `@claude`メンションの検出ロジック
   - コメント本文からの指示抽出

2. **Tracking Comment**: `src/tracking/index.ts`
   - チェックボックス形式の進捗表示
   - コメントの更新ロジック

3. **Mode Detection**: `src/modes/detector.ts`
   - agent / one-shot / iterate の判定
   - 各モードの実行フロー

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
- Phase 1では実装は行わず、準備と計画のみ
- 既存のClaude Code GitHub Actionsコードは参照のみ
