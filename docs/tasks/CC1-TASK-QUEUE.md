# CC-1 タスクキュー

> **担当レイヤー**: Core Layer
> **ディレクトリ所有権**: `packages/core/`, `packages/shared/`
> **ブランチプレフィックス**: `feature/core/`
> **ベースブランチ**: `develop`

---

## タスク実行順序

以下のタスクを順番に実行してください。各タスク完了後、PRを作成してManusのレビューを待ってください。

---

### TASK-001: Monorepo構造の作成 ⭐ 最優先

**ブランチ**: `feature/core/task-001-monorepo-setup`

**作業内容**:

1. pnpmワークスペースを設定
```bash
cd claude-flow-x

# pnpm-workspace.yaml を作成
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF
```

2. packagesディレクトリを作成
```bash
mkdir -p packages/{core,shared,github,swarm,mobile-bridge,mobile-app}
```

3. ルートpackage.jsonを更新
```json
{
  "name": "claude-flow-x",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.56.0"
  }
}
```

4. 共通tsconfig.jsonを作成
```bash
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOF
```

5. progress.mdを更新（TASK-001を「🟡 In Progress」→「✅ Done」）

6. PRを作成
```bash
git checkout develop
git pull origin develop
git checkout -b feature/core/task-001-monorepo-setup
git add .
git commit -m "feat(core): Setup monorepo structure with pnpm workspaces"
git push origin feature/core/task-001-monorepo-setup
gh pr create --base develop --title "feat(core): Setup monorepo structure (TASK-001)" --body "## 変更内容
- pnpm-workspace.yaml を作成
- packages/ ディレクトリを作成
- tsconfig.base.json を作成
- ルート package.json を更新

## 完了条件
- [x] pnpm-workspace.yaml が存在する
- [x] packages/ ディレクトリが存在する
- [x] pnpm install が成功する"
```

**完了条件**:
- [ ] `pnpm-workspace.yaml`が存在する
- [ ] `packages/`ディレクトリが存在する
- [ ] `pnpm install`が成功する

---

### TASK-002: Event Busの実装

**前提条件**: TASK-001がマージされていること

**ブランチ**: `feature/core/task-002-event-bus`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/core/task-002-event-bus
```

2. 既存コードをコピー（リポジトリ内の_upstreamから）
```bash
mkdir -p packages/core/src
cp _upstream/claude-flow/core/event-bus.ts packages/core/src/event-bus.ts
```

3. packages/core/package.jsonを作成
```json
{
  "name": "@claude-flow-x/core",
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
    "zod": "^3.22.0"
  }
}
```

4. packages/core/tsup.config.tsを作成
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
```

5. packages/core/src/index.tsを作成
```typescript
export * from './event-bus';
```

6. progress.mdを更新

7. PRを作成
```bash
git add .
git commit -m "feat(core): Implement Event Bus with type-safe events"
git push origin feature/core/task-002-event-bus
gh pr create --base develop --title "feat(core): Implement Event Bus (TASK-002)" --body "..."
```

**完了条件**:
- [ ] `packages/core/src/event-bus.ts`が存在する
- [ ] `pnpm build`が成功する
- [ ] 型安全なイベント発行/購読ができる

---

### TASK-003: State Managerの実装
**前提条件**: TASK-002がマージされていること

**ブランチ**: `feature/core/task-003-state-manager`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/core/task-003-state-manager
```

2. Zustandをインストール
```bash
cd packages/core
pnpm add zustand
```

3. packages/core/src/state-manager.tsを作成
```typescript
import { create } from 'zustand';
import { eventBus } from './event-bus';

interface AppState {
  // 状態定義
  projects: Map<string, Project>;
  agents: Map<string, Agent>;
  tasks: Map<string, Task>;
  
  // アクション
  updateProject: (id: string, data: Partial<Project>) => void;
  updateAgent: (id: string, data: Partial<Agent>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: new Map(),
  agents: new Map(),
  tasks: new Map(),
  
  updateProject: (id, data) => {
    set((state) => {
      const projects = new Map(state.projects);
      const existing = projects.get(id) || {};
      projects.set(id, { ...existing, ...data });
      return { projects };
    });
    eventBus.emit('state:project_updated', { id, data });
  },
  
  // ... 他のアクション
}));
```

4. packages/core/src/index.tsを更新
```typescript
export * from './event-bus';
export * from './state-manager';
```

5. progress.mdを更新

6. PRを作成

**完了条件**:
- [ ] `packages/core/src/state-manager.ts`が存在する
- [ ] Event Busと連携している
- [ ] 状態変更時にイベントが発行される

---

### TASK-004: Config Managerの実装

**前提条件**: TASK-003がマージされていること

**ブランチ**: `feature/core/task-004-config-manager`

**作業内容**:

1. developを最新に更新
2. 既存コードをコピー（リポジトリ内の_upstreamから）
```bash
cp _upstream/claude-flow/core/ConfigManager.ts packages/core/src/config-manager.ts
```

3. cosmiconfigとzodをインストール
```bash
cd packages/core
pnpm add cosmiconfig zod
```

4. 設定スキーマを定義
5. progress.mdを更新
6. PRを作成

**完了条件**:
- [ ] `packages/core/src/config-manager.ts`が存在する
- [ ] 設定ファイルの自動検索ができる
- [ ] 型安全な設定アクセスができる

---

### TASK-005: Loggerの実装


**前提条件**: TASK-004がマージされていること

**ブランチ**: `feature/core/task-005-logger`

**作業内容**:

1. developを最新に更新
2. 既存コードをコピー（リポジトリ内の_upstreamから）
```bash
cp _upstream/claude-flow/core/Logger.ts packages/core/src/logger.ts
```

3. Event Busと連携するように修正
4. progress.mdを更新
5. PRを作成

**完了条件**:
- [ ] `packages/core/src/logger.ts`が存在する
- [ ] ログレベル（debug, info, warn, error）が機能する
- [ ] Event Busにログイベントを発行する

---

## 注意事項

1. **必ず`develop`からブランチを作成**
2. **PRのベースは必ず`develop`**
3. **他のCCのディレクトリは編集しない**
4. **各タスク完了後、PRを作成してManusのレビューを待つ**
5. **前のタスクがマージされるまで次のタスクを開始しない**
6. **再利用コードは`_upstream/`ディレクトリにあります**
