# Remote Cursor Mobile App

Claude Code開発プロセスをリアルタイムで監視するモバイルアプリケーション。

## 機能

### ダッシュボード
- プロジェクト全体の進捗サマリー（円形プログレスチャート）
- 開発トラック一覧と各トラックの進捗状況
- ブロッカーアラート（警告バナー）

### トラック詳細
- トラック情報カード（名前、ステータス、担当エージェント）
- タスクタイムライン（ステータスアイコン付き）

### ブロッカー詳細
- ブロッカー情報カード（理由、影響タスク、検出日時）
- 解決指示送信フォーム（WebSocket経由）

### アクティビティログ
- リアルタイムログストリーム
- ソース別フィルタリング（claude-1, claude-2, system, websocket）
- パフォーマンス最適化されたFlatList

## 技術スタック

- **Framework**: React Native (Expo)
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Real-time**: Socket.IO Client
- **Push Notifications**: Expo Notifications
- **Styling**: theme.ts (カスタムテーマシステム)

## ディレクトリ構造

```
src/mobile/
├── App.tsx                 # エントリーポイント
├── components/
│   ├── dashboard/          # ダッシュボードコンポーネント
│   ├── track/              # トラック詳細コンポーネント
│   ├── blocker/            # ブロッカー詳細コンポーネント
│   └── activity/           # アクティビティログコンポーネント
├── screens/
│   ├── DashboardScreen.tsx
│   ├── TrackDetailScreen.tsx
│   ├── BlockerDetailScreen.tsx
│   └── ActivityLogScreen.tsx
├── navigation/
│   ├── types.ts            # ナビゲーション型定義
│   └── BottomTabNavigator.tsx
├── stores/
│   └── dashboardStore.ts   # Zustand状態管理
├── hooks/
│   ├── useWebSocket.ts     # WebSocket接続フック
│   └── usePushNotifications.ts
└── theme.ts                # テーマ定義
```

## セットアップ

```bash
cd src/mobile
npm install
npx expo start
```

## 開発

```bash
# iOS シミュレーター
npx expo start --ios

# Android エミュレーター
npx expo start --android

# Web ブラウザ
npx expo start --web

# 型チェック
npx tsc --noEmit
```

## 環境変数

WebSocket接続先はデフォルトで公開サーバーURLが設定されています。ローカル開発の場合は環境変数で変更可能です。

```bash
# .env (オプション)
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
```

## ビルド

```bash
# EAS Build（Expo Application Services）
npx eas build --platform ios
npx eas build --platform android
```
