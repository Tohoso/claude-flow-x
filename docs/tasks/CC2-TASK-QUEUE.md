# CC-2 タスクキュー

> **担当レイヤー**: GitHub Layer
> **ディレクトリ所有権**: `packages/github/`
> **ブランチプレフィックス**: `feature/github/`
> **ベースブランチ**: `develop`

---

## タスク実行順序

以下のタスクを順番に実行してください。各タスク完了後、PRを作成してManusのレビューを待ってください。

---

### TASK-010: パッケージ初期化

**前提条件**: TASK-001（CC-1）がマージされていること

**ブランチ**: `feature/github/task-010-package-init`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/github/task-010-package-init
```

2. packages/github/package.jsonを作成
```bash
mkdir -p packages/github/src
cat > packages/github/package.json << 'EOF'
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
    "@actions/core": "^1.10.0",
    "@actions/github": "^6.0.0",
    "@octokit/rest": "^20.0.0",
    "zod": "^3.22.0"
  }
}
EOF
```

3. packages/github/tsup.config.tsを作成
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
```

4. packages/github/src/index.tsを作成
```typescript
// GitHub Layer entry point
export * from './api';
export * from './operations';
export * from './modes';
```

5. progress.mdを更新（TASK-010を「✅ Done」）

6. PRを作成
```bash
git add .
git commit -m "feat(github): Initialize GitHub package structure"
git push origin feature/github/task-010-package-init
gh pr create --base develop --title "feat(github): Initialize package (TASK-010)" --body "..."
```

**完了条件**:
- [ ] `packages/github/package.json`が存在する
- [ ] `pnpm install`が成功する

---

### TASK-011: GitHub Actionsコード移植

**前提条件**: TASK-010がマージされていること

**ブランチ**: `feature/github/task-011-code-migration`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/github/task-011-code-migration
```

2. 既存コードを一括コピー
```bash
# APIレイヤー
mkdir -p packages/github/src/api
cp -r /home/ubuntu/claude-code-action/src/github/api/* packages/github/src/api/

# Operations
mkdir -p packages/github/src/operations
cp -r /home/ubuntu/claude-code-action/src/github/operations/* packages/github/src/operations/

# Validation
mkdir -p packages/github/src/validation
cp -r /home/ubuntu/claude-code-action/src/github/validation/* packages/github/src/validation/

# Data
mkdir -p packages/github/src/data
cp -r /home/ubuntu/claude-code-action/src/github/data/* packages/github/src/data/

# Modes
mkdir -p packages/github/src/modes
cp -r /home/ubuntu/claude-code-action/src/modes/* packages/github/src/modes/

# MCP
mkdir -p packages/github/src/mcp
cp -r /home/ubuntu/claude-code-action/src/mcp/* packages/github/src/mcp/

# Utils
mkdir -p packages/github/src/utils
cp -r /home/ubuntu/claude-code-action/src/github/utils/* packages/github/src/utils/
cp /home/ubuntu/claude-code-action/src/utils/retry.ts packages/github/src/utils/

# Types and Constants
cp /home/ubuntu/claude-code-action/src/github/types.ts packages/github/src/types.ts
cp /home/ubuntu/claude-code-action/src/github/constants.ts packages/github/src/constants.ts
cp /home/ubuntu/claude-code-action/src/github/context.ts packages/github/src/context.ts
cp /home/ubuntu/claude-code-action/src/github/token.ts packages/github/src/token.ts

# action.yml
cp /home/ubuntu/claude-code-action/action.yml .
```

3. importパスを修正（相対パスに変更）
```bash
# 各ファイルのimportパスを更新
# 例: import { ... } from '../github/api' → import { ... } from './api'
```

4. packages/github/src/index.tsを更新
```typescript
export * from './api';
export * from './operations';
export * from './validation';
export * from './modes';
export * from './types';
export * from './constants';
```

5. progress.mdを更新

6. PRを作成
```bash
git add .
git commit -m "feat(github): Migrate Claude Code GitHub Actions code"
git push origin feature/github/task-011-code-migration
gh pr create --base develop --title "feat(github): Migrate GitHub Actions code (TASK-011)" --body "..."
```

**完了条件**:
- [ ] 全てのコードが移植されている
- [ ] importパスが修正されている
- [ ] `pnpm build`が成功する

---

### TASK-012: Event Bus統合

**前提条件**: TASK-011がマージされていること、TASK-002（CC-1）がマージされていること

**ブランチ**: `feature/github/task-012-event-bus-integration`

**作業内容**:

1. developを最新に更新
2. Event Busをインポート
```typescript
import { eventBus } from '@claude-flow-x/core';
```

3. 各モジュールでEvent Busイベントを発行
```typescript
// PRイベント
eventBus.emit('github:pr_opened', { ... });
eventBus.emit('github:pr_merged', { ... });

// Issueイベント
eventBus.emit('github:issue_created', { ... });
eventBus.emit('github:issue_closed', { ... });

// @claudeメンション
eventBus.emit('github:claude_mentioned', { ... });
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
3. **`packages/github/`以外のディレクトリは編集しない**
4. **各タスク完了後、PRを作成してManusのレビューを待つ**
5. **前のタスクがマージされるまで次のタスクを開始しない**
