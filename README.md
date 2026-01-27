# Ogori Counter (奢りカウンター)

次は誰が奢る番かを管理するシンプルなアプリケーションです。
Dockerを使用して簡単に立ち上げることができ、データはローカルのJSONファイルに永続化されます。

## 機能
- **公正なターン制**: 設定された順序で奢る担当が回ります。
- **リッチなUI**: 現在の担当が表示され、奢りが完了するとボタンを押して次の人に交代できます。
- **データ永続化**: コンテナを再起動してもデータは保持されます（`data.json`）。

## 技術スタック
- **Frontend**: Next.js 14 (App Router), React, Framer Motion
- **Styling**: Css Modules, Globals (Vanilla CSS with Variables)
- **Backend**: Server Actions, JSON persistence
- **Container**: Docker

## 開発環境のセットアップ

### 前提条件
- Node.js 18+
- Docker (オプション)

### ローカルでの実行
```bash
npm install
npm run dev
```
http://localhost:3000 にアクセスしてください。

## Dockerでのデプロイ（推奨）

Dockerを使用することで、環境構築の手間なくアプリを起動できます。

1. **イメージのビルドと起動**
   ```bash
   docker-compose up --build -d
   ```

2. **アプリへのアクセス**
   ブラウザで http://localhost:3000 を開いてください。

3. **データの永続化**
   `docker-compose.yml` の設定により、カレントディレクトリの `data.json` がコンテナ内の `/app/data.json` にマウントされます。
   これにより、コンテナを停止・削除してもデータは消えません。

4. **停止**
   ```bash
   docker-compose down
   ```

## カスタマイズ
- **メンバーの追加**: `src/lib/store.ts` の `INITIAL_STATE` を編集するか、データをリセット（`data.json`を削除）してください。
