# いまなにしてる？アプリ - 開発・デプロイガイド

## 概要
「いまなにしてる？」は、シンプルなタイムラインアプリです。ユーザーは名前を入力してログインし、50文字以内で現在の状況を投稿できます。他のユーザーの投稿は3秒おきに自動更新されます。

## 技術スタック
- **フロントエンド**: HTML, CSS, JavaScript (Vanilla)
- **バックエンド**: Node.js + Express
- **データベース**: SQLite (メモリ内)
- **デプロイ**: Vercel

## プロジェクト構造
```
onoyoimanani/
├── api/
│   └── index.js          # バックエンドAPI
├── src/
│   └── index.html        # フロントエンド
├── package.json          # 依存関係
├── vercel.json          # Vercel設定
└── README.md            # このファイル
```

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. ローカル開発サーバーの起動
```bash
npm run dev
```

または

```bash
vercel dev
```

### 3. アクセス
ブラウザで `http://localhost:3000` にアクセス

### 4. 開発サーバーの停止
ターミナルで `Ctrl + C` を押す

### 5. 再起動
```bash
npm run dev
```

## リモートサーバーへのデプロイ（Vercel）

### 前提条件
- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録）
- GitHubアカウント
- プロジェクトがGitHubリポジトリにプッシュ済み

### デプロイ手順

#### 1. Vercel CLIのインストール（初回のみ）
```bash
npm install -g vercel
```

#### 2. Vercelにログイン
```bash
vercel login
```

#### 3. プロジェクトをVercelにデプロイ
```bash
vercel
```

初回デプロイ時は以下の質問に答えてください：
- Set up and deploy "~/path/to/onoyoimanani"? [Y/n] → `Y`
- Which scope do you want to deploy to? → 自分のアカウントを選択
- Link to existing project? [y/N] → `N`
- What's your project's name? → `onoyoimanani` または任意の名前
- In which directory is your code located? → `./`

#### 4. 本番環境へのデプロイ
```bash
vercel --prod
```

### デプロイ後の確認
- Vercelダッシュボードでデプロイ状況を確認
- 提供されたURLでアプリにアクセスして動作確認

### 今後のデプロイ
コードを変更後、以下のコマンドで再デプロイ：
```bash
vercel --prod
```

または、GitHubと連携している場合は、mainブランチにプッシュするだけで自動デプロイされます。

## 機能説明

### ログイン機能
- 名前を入力してログイン
- クッキーでログイン状態を保持（7日間有効）
- ブラウザを閉じてもログイン状態が維持される

### 投稿機能
- 50文字以内で現在の状況を投稿
- Enterキーで投稿
- 文字数カウンター表示

### タイムライン機能
- 最新1000件の投稿を表示
- 3秒おきに自動更新
- 投稿者名、投稿日時、内容を表示

### ログアウト機能
- ヘッダーのログアウトボタンでログアウト
- ログアウト後はログイン画面に戻る

## API エンドポイント

### POST /api/login
ログイン処理
```json
{
  "name": "ユーザー名"
}
```

### GET /api/check-login
ログイン状態確認
```json
{
  "loggedIn": true,
  "userName": "ユーザー名"
}
```

### POST /api/logout
ログアウト処理

### POST /api/posts
投稿作成
```json
{
  "content": "投稿内容"
}
```

### GET /api/posts
タイムライン取得（最新1000件）

## トラブルシューティング

### ローカル開発でエラーが発生する場合
1. Node.jsのバージョンを確認（18.0.0以上が必要）
2. `npm install` を再実行
3. `vercel dev` で起動

### デプロイでエラーが発生する場合
1. `vercel.json` の設定を確認
2. `package.json` の依存関係を確認
3. Vercelダッシュボードでログを確認

### データが保存されない場合
現在はメモリ内SQLiteを使用しているため、サーバー再起動時にデータが消えます。本格運用時はファイルベースのSQLiteまたは外部データベースに変更することを推奨します。

## 今後の改善案
- ファイルベースSQLiteへの変更
- リアルタイム更新（WebSocket）
- ユーザー認証の強化
- 投稿の編集・削除機能
- 画像投稿機能
