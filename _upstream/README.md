# Upstream Resources

このディレクトリには、Claude-Flow-Xで再利用する既存プロジェクトのコードが含まれています。

## ディレクトリ構造

```
_upstream/
├── claude-flow/           # ruvnet/claude-flow からのコード
│   ├── core/              # Event Bus, ConfigManager, Logger
│   ├── swarm/             # Agent Coordinator, Swarm Manager
│   ├── memory/            # Memory Manager, Vector Store
│   ├── monitoring/        # Real-time Monitor
│   ├── agents/            # Agent Templates
│   └── utils/             # Utilities, Types
│
├── claude-code-action/    # anthropics/claude-code-action からのコード
│   ├── github/            # GitHub API, Operations
│   ├── modes/             # Agent, Review, Diff modes
│   ├── mcp/               # MCP Integration
│   ├── create-prompt/     # Prompt Generation
│   ├── entrypoints/       # Entry Points
│   ├── prepare/           # Preparation Logic
│   └── utils/             # Utilities
│
└── remote-cursor/         # Remote Cursor からのコード
    ├── server/            # WebSocket, Push Notifications, Progress Parser
    │   ├── websocket/     # Socket.IO handlers
    │   ├── services/      # FileWatcher, ProgressParser, PushNotification
    │   └── config/        # Server configuration
    │
    └── mobile/            # React Native / Expo UI
        ├── app/           # Screens
        ├── components/    # UI Components
        ├── hooks/         # Custom Hooks
        ├── stores/        # Zustand Stores
        └── theme.ts       # Theme Configuration
```

## 使用方法

各CCは、タスクキューに記載されたコマンドでこれらのコードを `packages/` にコピーして使用します。

### 例: CC-1 (Core Layer)

```bash
cp -r _upstream/claude-flow/core/* packages/core/src/
```

### 例: CC-2 (GitHub Layer)

```bash
cp -r _upstream/claude-code-action/* packages/github/src/
```

### 例: CC-3 (Swarm Layer)

```bash
cp -r _upstream/claude-flow/swarm/* packages/swarm/src/
cp -r _upstream/claude-flow/memory/* packages/swarm/src/memory/
cp -r _upstream/claude-flow/monitoring/* packages/swarm/src/monitoring/
```

### 例: CC-4 (Mobile Bridge Layer)

```bash
cp -r _upstream/remote-cursor/server/* packages/mobile-bridge/src/
```

### 例: CC-5 (Mobile App Layer)

```bash
cp -r _upstream/remote-cursor/mobile/* packages/mobile-app/
```

## ライセンス

- **claude-flow**: MIT License (ruvnet/claude-flow)
- **claude-code-action**: MIT License (anthropics/claude-code-action)
- **remote-cursor**: Original project code
