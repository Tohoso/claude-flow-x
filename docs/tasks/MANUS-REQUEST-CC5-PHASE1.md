# CC-5 Phase 1 タスク指示書

> **重要**: このタスクでは既存のRemote Cursorモバイルアプリコードを最大限再利用します。
> 再利用元: `/home/ubuntu/remote-cursor/src/mobile/` (Remote Cursorモバイルアプリ)

## 担当者情報

| 項目 | 値 |
|:---|:---|
| 担当CC | CC-5 |
| 担当レイヤー | Mobile App |
| ディレクトリ所有権 | `packages/mobile-app/` |
| ブランチプレフィックス | `feature/mobile-app/` |

---

## 概要

CC-5は、Mobile App Layerを担当します。React Native（Expo）を使用してモバイルアプリを実装します。Phase 1では、Expoプロジェクトの初期化とRemote CursorからのUIコンポーネント移植計画を作成します。

---

## タスク一覧

### TASK-040: Expo プロジェクト初期化

**目的**: Expo + React Native + TypeScriptのプロジェクトを作成する

**前提条件**: TASK-001（monorepo構造）が完了していること

**作業内容**:

1. `packages/mobile-app/`ディレクトリを作成
```bash
cd packages
npx create-expo-app mobile-app --template blank-typescript
```

2. ディレクトリ構造を整理
```
packages/mobile-app/
├── app/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── TrackDetailScreen.tsx
│   │   ├── BlockerDetailScreen.tsx
│   │   └── ActivityLogScreen.tsx
│   └── navigation/
│       └── types.ts
├── components/
│   ├── dashboard/
│   │   ├── ProgressSummaryCard.tsx
│   │   ├── TrackCard.tsx
│   │   └── BlockerAlert.tsx
│   ├── track/
│   │   ├── TrackInfoCard.tsx
│   │   └── TaskTimeline.tsx
│   ├── blocker/
│   │   ├── BlockerCard.tsx
│   │   └── ResolveBlockerForm.tsx
│   └── common/
│       └── index.ts
├── hooks/
│   ├── useWebSocket.ts
│   └── usePushNotifications.ts
├── stores/
│   └── dashboardStore.ts
├── theme/
│   └── index.ts
├── App.tsx
├── package.json
├── tsconfig.json
└── app.json
```

3. 必要な依存関係を追加
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/native-stack": "^6.0.0",
    "react-native-screens": "~3.29.0",
    "react-native-safe-area-context": "4.8.2",
    "socket.io-client": "^4.7.0",
    "zustand": "^4.4.0",
    "expo-notifications": "~0.27.0",
    "react-native-svg": "^14.0.0",
    "react-native-circular-progress": "^1.3.0"
  }
}
```

4. 基本的なApp.tsxを作成
```typescript
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* TODO: Add screens in Phase 3 */}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
```

**完了条件**:
- [ ] `packages/mobile-app/`ディレクトリが作成されている
- [ ] `npx expo start`が成功する
- [ ] 基本的なナビゲーション構造が設定されている

**ブランチ**: `feature/mobile-app/task-040-expo-init`

---

#### TASK-041: Remote Cursor UIコンポーネント移植

**目的**: Remote CursorのUIコンポーネントを移植する

**再利用元**: `remote-cursor/src/mobile/`

**作業内容**:

1. 既存ファイルを一括コピー
```bash
# Screens
mkdir -p packages/mobile-app/app/screens
cp /home/ubuntu/remote-cursor/src/mobile/app/screens/*.tsx packages/mobile-app/app/screens/

# Components - Dashboard
mkdir -p packages/mobile-app/components/dashboard
cp /home/ubuntu/remote-cursor/src/mobile/components/dashboard/*.tsx packages/mobile-app/components/dashboard/

# Components - Track
mkdir -p packages/mobile-app/components/track
cp /home/ubuntu/remote-cursor/src/mobile/components/track/*.tsx packages/mobile-app/components/track/

# Components - Blocker
mkdir -p packages/mobile-app/components/blocker
cp /home/ubuntu/remote-cursor/src/mobile/components/blocker/*.tsx packages/mobile-app/components/blocker/

# Components - Activity
mkdir -p packages/mobile-app/components/activity
cp /home/ubuntu/remote-cursor/src/mobile/components/activity/*.tsx packages/mobile-app/components/activity/

# Hooks
mkdir -p packages/mobile-app/hooks
cp /home/ubuntu/remote-cursor/src/mobile/hooks/*.ts packages/mobile-app/hooks/

# Stores
mkdir -p packages/mobile-app/stores
cp /home/ubuntu/remote-cursor/src/mobile/stores/*.ts packages/mobile-app/stores/

# Theme
mkdir -p packages/mobile-app/theme
cp /home/ubuntu/remote-cursor/src/mobile/theme/*.ts packages/mobile-app/theme/

# Navigation
mkdir -p packages/mobile-app/app/navigation
cp /home/ubuntu/remote-cursor/src/mobile/navigation/*.ts packages/mobile-app/app/navigation/

# App.tsx
cp /home/ubuntu/remote-cursor/src/mobile/App.tsx packages/mobile-app/App.tsx
```

2. 移植後のディレクトリ構造
```
packages/mobile-app/
├── app/
│   ├── screens/       # ← remote-cursor/src/mobile/app/screens/
│   └── navigation/    # ← remote-cursor/src/mobile/navigation/
├── components/
│   ├── dashboard/     # ← remote-cursor/src/mobile/components/dashboard/
│   ├── track/         # ← remote-cursor/src/mobile/components/track/
│   ├── blocker/       # ← remote-cursor/src/mobile/components/blocker/
│   └── activity/      # ← remote-cursor/src/mobile/components/activity/
├── hooks/             # ← remote-cursor/src/mobile/hooks/
├── stores/            # ← remote-cursor/src/mobile/stores/
├── theme/             # ← remote-cursor/src/mobile/theme/
└── App.tsx            # ← remote-cursor/src/mobile/App.tsx
```

3. importパスを更新（相対パスに変更）

4. 元の作業内容（分析）:
   Remote Cursor（`/home/ubuntu/remote-cursor/`）のUIコンポーネントを分析

2. 移植対象のコンポーネントを特定
```markdown
# Remote Cursor UI コンポーネント移植計画

## 移植対象コンポーネント

### Dashboard Screen
| コンポーネント | 元ファイル | 移植先 |
|:---|:---|:---|
| ProgressSummaryCard | src/mobile/components/dashboard/ | packages/mobile-app/components/dashboard/ |
| TrackCard | src/mobile/components/dashboard/ | packages/mobile-app/components/dashboard/ |
| BlockerAlert | src/mobile/components/dashboard/ | packages/mobile-app/components/dashboard/ |

### Track Detail Screen
| コンポーネント | 元ファイル | 移植先 |
|:---|:---|:---|
| TrackInfoCard | src/mobile/components/track/ | packages/mobile-app/components/track/ |
| TaskTimeline | src/mobile/components/track/ | packages/mobile-app/components/track/ |
| TaskTimelineItem | src/mobile/components/track/ | packages/mobile-app/components/track/ |

### Blocker Detail Screen
| コンポーネント | 元ファイル | 移植先 |
|:---|:---|:---|
| BlockerCard | src/mobile/components/blocker/ | packages/mobile-app/components/blocker/ |
| ResolveBlockerForm | src/mobile/components/blocker/ | packages/mobile-app/components/blocker/ |

### Activity Log Screen
| コンポーネント | 元ファイル | 移植先 |
|:---|:---|:---|
| FilterChips | src/mobile/components/activity/ | packages/mobile-app/components/activity/ |
| LogEntry | src/mobile/components/activity/ | packages/mobile-app/components/activity/ |

### Hooks
| フック | 元ファイル | 移植先 |
|:---|:---|:---|
| useWebSocket | src/mobile/hooks/ | packages/mobile-app/hooks/ |
| usePushNotifications | src/mobile/hooks/ | packages/mobile-app/hooks/ |

### Stores
| ストア | 元ファイル | 移植先 |
|:---|:---|:---|
| dashboardStore | src/mobile/stores/ | packages/mobile-app/stores/ |

## 変更点

### WebSocket接続先
- Remote Cursor: ハードコードされたURL
- Claude-Flow-X: 設定ファイルから読み込み

### 状態管理
- Remote Cursor: Zustand（ローカル）
- Claude-Flow-X: Zustand（Core Layerと同期）

### テーマ
- Remote Cursor: インラインスタイル多用
- Claude-Flow-X: theme.tsに統一
```

3. UI/UXデザインガイドを作成
```markdown
# UI/UX デザインガイド

## カラーパレット（Remote Cursorから継承）

| 名前 | 値 | 用途 |
|:---|:---|:---|
| background | #1a1a2e | 背景 |
| surface | #16213e | カード背景 |
| primary | #0f3460 | プライマリ |
| accent | #e94560 | アクセント |
| text | #ffffff | テキスト |
| textSecondary | #a0a0a0 | セカンダリテキスト |

## タイポグラフィ

| 名前 | サイズ | 太さ |
|:---|:---|:---|
| h1 | 24px | bold |
| h2 | 20px | bold |
| body | 16px | normal |
| caption | 14px | normal |

## コンポーネントスタイル

### カード
- 角丸: 12px
- パディング: 16px
- 影: なし（フラットデザイン）

### ボタン
- 角丸: 8px
- パディング: 12px 24px
- プライマリ: accent色

### プログレスバー
- 高さ: 8px
- 角丸: 4px
- 背景: surface
- 前景: accent
```

4. Phase 3のタスク分割を作成
```markdown
## Phase 3 タスク分割案

| Task ID | 機能 | 見積もり |
|:---|:---|:---|
| TASK-042 | Dashboard Screen | 8h |
| TASK-043 | Track Detail Screen | 6h |
| TASK-044 | Blocker Detail Screen | 6h |
| TASK-045 | Activity Log Screen | 6h |
| TASK-046 | Navigation Setup | 4h |
| TASK-047 | Push Notification Client | 4h |
```

5. `docs/design/MOBILE_APP_DESIGN.md`を作成

**完了条件**:
- [ ] 移植対象コンポーネントが特定されている
- [ ] UI/UXデザインガイドが作成されている
- [ ] Phase 3のタスク分割が完了している

**ブランチ**: `feature/mobile-app/task-041-ui-migration-plan`

---

## 参考資料

### Remote Cursor の UI 構造

```
remote-cursor/src/mobile/
├── app/
│   └── screens/
│       ├── DashboardScreen.tsx
│       ├── TrackDetailScreen.tsx
│       ├── BlockerDetailScreen.tsx
│       └── ActivityLogScreen.tsx
├── components/
│   ├── dashboard/
│   │   ├── ProgressSummaryCard.tsx
│   │   ├── TrackCard.tsx
│   │   └── BlockerAlert.tsx
│   ├── track/
│   │   ├── TrackInfoCard.tsx
│   │   └── TaskTimeline.tsx
│   └── blocker/
│       ├── BlockerCard.tsx
│       └── ResolveBlockerForm.tsx
├── hooks/
│   ├── useWebSocket.ts
│   └── usePushNotifications.ts
├── stores/
│   └── dashboardStore.ts
└── theme/
    └── index.ts
```

### 画面デザイン（Remote Cursorから継承）

1. **Dashboard Screen**
   - 円形プログレスチャート（92%等）
   - トラックカード一覧
   - ブロッカーアラート（赤いバナー）

2. **Track Detail Screen**
   - トラック情報カード
   - タスクタイムライン（縦のコネクターライン）

3. **Blocker Detail Screen**
   - ブロッカーカード
   - 解決指示フォーム

4. **Activity Log Screen**
   - フィルターチップ（水平スクロール）
   - ログエントリリスト

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
- Remote CursorのUIデザインを踏襲する
- テーマはtheme.tsに統一し、インラインスタイルを避ける
