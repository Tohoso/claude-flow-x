# タスク一覧

## 1. 概要

Claude-Flow-Xの開発タスクを、担当CC別に整理したリストです。

## 2. Phase 1: 基盤統合（2週間）

### CC-1: Core Layer

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-001 | monorepo構造のセットアップ | P0 | - | 4h |
| TASK-002 | Event Bus実装 | P0 | TASK-001 | 8h |
| TASK-003 | State Manager実装 | P0 | TASK-001 | 8h |
| TASK-004 | Config Manager実装 | P0 | TASK-001 | 6h |
| TASK-005 | Logger実装 | P1 | TASK-001 | 4h |
| TASK-006 | 共有型定義 | P0 | TASK-001 | 4h |

### CC-2: GitHub Layer（Phase 1では準備のみ）

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-010 | パッケージ初期化 | P1 | TASK-001 | 2h |
| TASK-011 | GitHub Actions移植計画 | P1 | - | 4h |

### CC-3: Swarm Layer（Phase 1では準備のみ）

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-020 | 既存コードの整理 | P1 | TASK-001 | 4h |
| TASK-021 | Event Bus統合計画 | P1 | TASK-002 | 4h |

### CC-4: Mobile Bridge（Phase 1では準備のみ）

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-030 | パッケージ初期化 | P1 | TASK-001 | 2h |
| TASK-031 | WebSocket設計 | P1 | TASK-002 | 4h |

### CC-5: Mobile App（Phase 1では準備のみ）

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-040 | Expo プロジェクト初期化 | P1 | TASK-001 | 2h |
| TASK-041 | Remote Cursor UIコンポーネント移植計画 | P1 | - | 4h |

---

## 3. Phase 2: GitHub Layer統合（2週間）

### CC-2: GitHub Layer

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-012 | Mention Trigger実装 | P0 | TASK-002 | 8h |
| TASK-013 | Tracking Comment実装 | P0 | TASK-002, TASK-003 | 8h |
| TASK-014 | PR Actions実装 | P0 | TASK-002 | 8h |
| TASK-015 | Review Handler実装 | P1 | TASK-014 | 6h |
| TASK-016 | GitHub Actions Workflow | P1 | TASK-012-015 | 4h |

### CC-3: Swarm Layer

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-022 | Agent Registry移行 | P0 | TASK-002 | 8h |
| TASK-023 | Coordinator移行 | P0 | TASK-002, TASK-003 | 8h |
| TASK-024 | Memory System移行 | P1 | TASK-003 | 6h |
| TASK-025 | GitHub Event Handler | P0 | TASK-012, TASK-023 | 6h |

---

## 4. Phase 3: Mobile Layer統合（2週間）

### CC-4: Mobile Bridge

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-032 | WebSocket Server実装 | P0 | TASK-002 | 8h |
| TASK-033 | Push Notification Service | P0 | TASK-032 | 6h |
| TASK-034 | Progress Parser移植 | P1 | TASK-003 | 4h |
| TASK-035 | Event Bridge実装 | P0 | TASK-002, TASK-032 | 6h |

### CC-5: Mobile App

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-042 | Dashboard Screen | P0 | TASK-032 | 8h |
| TASK-043 | Track Detail Screen | P0 | TASK-042 | 6h |
| TASK-044 | Blocker Detail Screen | P0 | TASK-042 | 6h |
| TASK-045 | Activity Log Screen | P1 | TASK-042 | 6h |
| TASK-046 | Navigation Setup | P0 | TASK-042-045 | 4h |
| TASK-047 | Push Notification Client | P1 | TASK-033 | 4h |

---

## 5. Phase 4: 統合テスト・ドキュメント（1週間）

### 全CC共通

| Task ID | タスク名 | 優先度 | 依存 | 見積もり |
|:---|:---|:---:|:---|:---|
| TASK-050 | 統合テスト | P0 | All | 8h |
| TASK-051 | E2Eテスト | P1 | TASK-050 | 8h |
| TASK-052 | ドキュメント整備 | P1 | All | 8h |
| TASK-053 | README更新 | P0 | TASK-052 | 4h |

---

## 6. タスク依存関係図

```
Phase 1 (Week 1-2)
==================
TASK-001 (monorepo)
    │
    ├──→ TASK-002 (Event Bus) ──→ TASK-012 (Mention Trigger)
    │         │                        │
    │         └──→ TASK-022 (Agent Registry)
    │                   │
    ├──→ TASK-003 (State) ──→ TASK-023 (Coordinator)
    │         │                   │
    │         └──→ TASK-013 (Tracking)
    │
    ├──→ TASK-004 (Config)
    │
    └──→ TASK-006 (Types)

Phase 2 (Week 3-4)
==================
TASK-012 ──→ TASK-014 (PR Actions) ──→ TASK-015 (Review)
    │              │
    └──→ TASK-025 (GitHub Event Handler)
              │
TASK-023 ────┘

Phase 3 (Week 5-6)
==================
TASK-002 ──→ TASK-032 (WebSocket) ──→ TASK-042 (Dashboard)
                  │                        │
                  └──→ TASK-033 (Push) ──→ TASK-047 (Push Client)
                            │
TASK-042 ──→ TASK-043 (Track Detail)
    │
    ├──→ TASK-044 (Blocker Detail)
    │
    └──→ TASK-045 (Activity Log)
              │
              └──→ TASK-046 (Navigation)

Phase 4 (Week 7)
================
All ──→ TASK-050 (Integration Test) ──→ TASK-051 (E2E)
                                            │
                                            └──→ TASK-052 (Docs)
                                                      │
                                                      └──→ TASK-053 (README)
```

---

## 7. 優先度定義

| 優先度 | 説明 |
|:---|:---|
| **P0** | 必須。他のタスクの前提条件となる |
| **P1** | 重要。Phase内で完了すべき |
| **P2** | あると良い。時間があれば実装 |
