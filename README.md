# Ogori Counter (奢りカウンター)

次は誰が奢る番かを管理するシンプルなWebアプリケーションです。

## 機能
- 🔄 **確認ベースのターン制** — 支払い担当の次の人が「ありがとう！」ボタンで確認 → ターンが回る
- 🏠 **ルーム機能** — 複数グループを管理。招待コードで簡単参加
- 🔐 **Google認証** — NextAuth.js によるセキュアなログイン
- 📱 **レスポンシブUI** — スマホ・PCどちらでも快適
- ⚡ **リアルタイム同期** — 5秒ポーリングで相手の操作が自動反映（バックグラウンドタブ時は停止）

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 + React 19 |
| スタイリング | Vanilla CSS + CSS Modules |
| アニメーション | Framer Motion |
| 認証 | NextAuth.js v5 (Google OAuth) |
| ORM | Prisma 5 |
| データベース | PostgreSQL (Neon) |
| ホスティング | Vercel (サーバーレス) |

## システム構成

### 全体アーキテクチャ

```mermaid
graph TB
    subgraph Client["🖥️ クライアント"]
        UI["React Components"]
        Poll["Polling (5秒間隔)"]
    end

    subgraph Vercel["☁️ Vercel"]
        Pages["Server Components"]
        Actions["Server Actions"]
        AuthAPI["Auth API"]
        Prisma["Prisma ORM"]
    end

    subgraph External["🌐 外部サービス"]
        Neon["Neon PostgreSQL"]
        Google["Google OAuth"]
    end

    UI -->|"Server Actions"| Actions
    Poll -->|"fetchRoom()"| Actions
    UI -->|"signIn/signOut"| AuthAPI
    Actions --> Prisma
    AuthAPI --> Prisma
    Prisma -->|"SQL over TLS"| Neon
    AuthAPI -->|"OAuth"| Google
```

### データフロー (ターン確認)

```mermaid
sequenceDiagram
    participant A as ユーザーA (支払い担当)
    participant B as ユーザーB (確認者)
    participant S as Server
    participant DB as Neon DB

    Note over A,B: Aが支払い担当

    B->>S: 「ありがとう！」ボタン押下
    S->>DB: Turn作成 + currentTurn更新
    DB-->>S: ✅
    S-->>B: 画面更新

    loop ポーリング
        A->>S: fetchRoom()
        S-->>A: currentTurn = B
        Note over A: 画面自動更新 ✨
    end
```

### DBスキーマ

```mermaid
erDiagram
    User ||--o{ RoomMember : joins
    User ||--o{ Turn : pays
    Room ||--o{ RoomMember : contains
    Room ||--o{ Turn : records

    User {
        String id PK
        String name
        String email UK
        String image
    }
    Room {
        String id PK
        String name
        String inviteCode UK
        String currentTurnUserId
    }
    RoomMember {
        String id PK
        String roomId FK
        String userId FK
        Int order
    }
    Turn {
        String id PK
        String roomId FK
        String userId FK
        DateTime createdAt
    }
```

## 開発環境のセットアップ

### 前提条件
- Node.js 20+
- Docker (PostgreSQL用)

### ローカル開発
```bash
# DBを起動
docker-compose up -d

# 依存関係インストール & Prismaセットアップ
npm install
npx prisma db push

# 開発サーバー
npm run dev
```
http://localhost:3000 にアクセス

### 環境変数 (`.env`)
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/ogori_db"
AUTH_SECRET="your-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

## デプロイ
[DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。
