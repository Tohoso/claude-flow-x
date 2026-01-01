# CC-5 タスクキュー

> **担当レイヤー**: Mobile App Layer
> **ディレクトリ所有権**: `packages/mobile-app/`
> **ブランチプレフィックス**: `feature/mobile-app/`
> **ベースブランチ**: `develop`

---

## タスク実行順序

以下のタスクを順番に実行してください。各タスク完了後、PRを作成してManusのレビューを待ってください。

---

### TASK-040: Expoプロジェクト初期化

**前提条件**: TASK-001（CC-1）がマージされていること

**ブランチ**: `feature/mobile-app/task-040-expo-init`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mobile-app/task-040-expo-init
```

2. Expoプロジェクトを初期化
```bash
cd packages
npx create-expo-app mobile-app --template blank-typescript
cd mobile-app
```

3. 必要な依存関係をインストール
```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
npx expo install zustand socket.io-client
npx expo install expo-notifications expo-device
npx expo install react-native-circular-progress react-native-svg
```

4. package.jsonを更新（ワークスペース対応）
```json
{
  "name": "@claude-flow-x/mobile-app",
  "version": "0.1.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

5. progress.mdを更新

6. PRを作成
```bash
git add .
git commit -m "feat(mobile-app): Initialize Expo project"
git push origin feature/mobile-app/task-040-expo-init
gh pr create --base develop --title "feat(mobile-app): Initialize Expo project (TASK-040)" --body "..."
```

**完了条件**:
- [ ] `packages/mobile-app/`が存在する
- [ ] `pnpm install`が成功する
- [ ] `npx expo start`が起動する

---

### TASK-041: UIコンポーネント移植

**前提条件**: TASK-040がマージされていること

**ブランチ**: `feature/mobile-app/task-041-ui-migration`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mobile-app/task-041-ui-migration
```

2. 既存コードを一括コピー（リポジトリ内の_upstreamから）
```bash
cd packages/mobile-app

# Screens
mkdir -p app/screens
cp ../../_upstream/remote-cursor/mobile/app/screens/*.tsx app/screens/

# Components - Dashboard
mkdir -p components/dashboard
cp ../../_upstream/remote-cursor/mobile/components/dashboard/*.tsx components/dashboard/

# Components - Track
mkdir -p components/track
cp ../../_upstream/remote-cursor/mobile/components/track/*.tsx components/track/

# Components - Blocker
mkdir -p components/blocker
cp ../../_upstream/remote-cursor/mobile/components/blocker/*.tsx components/blocker/

# Components - Activity
mkdir -p components/activity
cp ../../_upstream/remote-cursor/mobile/components/activity/*.tsx components/activity/

# Hooks
mkdir -p hooks
cp ../../_upstream/remote-cursor/mobile/hooks/*.ts hooks/

# Stores
mkdir -p stores
cp ../../_upstream/remote-cursor/mobile/stores/*.ts stores/

# Theme
cp ../../_upstream/remote-cursor/mobile/theme.ts theme.ts

# Navigation
mkdir -p app/navigation
cp ../../_upstream/remote-cursor/mobile/navigation/*.ts app/navigation/

# App.tsx
cp ../../_upstream/remote-cursor/mobile/App.tsx App.tsx
```

3. progress.mdを更新

4. PRを作成
```bash
git add .
git commit -m "feat(mobile-app): Migrate UI components from Remote Cursor"
git push origin feature/mobile-app/task-041-ui-migration
gh pr create --base develop --title "feat(mobile-app): Migrate UI components (TASK-041)" --body "..."
```

**完了条件**:
- [ ] 全てのコンポーネントが移植されている
- [ ] ディレクトリ構造が正しい

---

### TASK-042: importパス修正とビルド確認

**前提条件**: TASK-041がマージされていること

**ブランチ**: `feature/mobile-app/task-042-fix-imports`

**作業内容**:

1. developを最新に更新
```bash
git checkout develop
git pull origin develop
git checkout -b feature/mobile-app/task-042-fix-imports
```

2. 各ファイルのimportパスを修正
```typescript
// Before
import { theme } from '@/theme';
import { ProgressSummaryCard } from '@/components/dashboard/ProgressSummaryCard';

// After
import { theme } from '../theme';
import { ProgressSummaryCard } from '../components/dashboard/ProgressSummaryCard';
```

3. TypeScriptエラーを修正

4. Expoで動作確認
```bash
npx expo start --web
```

5. progress.mdを更新

6. PRを作成

**完了条件**:
- [ ] 全てのimportパスが修正されている
- [ ] TypeScriptエラーがない
- [ ] `npx expo start --web`で画面が表示される

---

### TASK-043: Mobile Bridge連携

**前提条件**: TASK-042がマージされていること、TASK-032（CC-4）がマージされていること

**ブランチ**: `feature/mobile-app/task-043-bridge-integration`

**作業内容**:

1. developを最新に更新
2. WebSocket接続先を環境変数化
```typescript
// hooks/useWebSocket.ts
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';
```

3. 新しいイベントタイプに対応
```typescript
// GitHubイベントの購読
socket.on('github_event', (data) => {
  // GitHub関連のUI更新
});
```

4. app.config.jsを作成
```javascript
export default {
  expo: {
    name: 'Claude Flow X',
    slug: 'claude-flow-x',
    extra: {
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3001',
    },
  },
};
```

5. progress.mdを更新

6. PRを作成

**完了条件**:
- [ ] Mobile Bridgeと接続できる
- [ ] リアルタイムで進捗が更新される
- [ ] プッシュ通知が受信できる

---

### TASK-044: GitHub統合UI追加

**前提条件**: TASK-043がマージされていること

**ブランチ**: `feature/mobile-app/task-044-github-ui`

**作業内容**:

1. developを最新に更新
2. GitHub関連のUIコンポーネントを追加
```
components/github/
├── PRCard.tsx           # PR情報カード
├── IssueCard.tsx        # Issue情報カード
├── GitHubEventList.tsx  # GitHubイベント一覧
└── index.ts
```

3. ダッシュボードにGitHubセクションを追加
4. GitHubイベント画面を追加
5. progress.mdを更新
6. PRを作成

**完了条件**:
- [ ] GitHub関連のUIが表示される
- [ ] PR/Issueの状態が確認できる
- [ ] @claudeメンションの通知が表示される

---

## 注意事項

1. **必ず`develop`からブランチを作成**
2. **PRのベースは必ず`develop`**
3. **`packages/mobile-app/`以外のディレクトリは編集しない**
4. **各タスク完了後、PRを作成してManusのレビューを待つ**
5. **前のタスクがマージされるまで次のタスクを開始しない**
6. **再利用コードは`_upstream/`ディレクトリにあります**
