const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../src')));

// SQLiteデータベースの初期化
const db = new sqlite3.Database(':memory:'); // メモリ内DB（本番ではファイルDBに変更）

// テーブル作成
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API エンドポイント

// ログイン（名前をクッキーに保存）
app.post('/api/login', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: '名前を入力してください' });
  }
  
  // クッキーに名前を保存（7日間有効）
  res.cookie('userName', name.trim(), { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7日
    httpOnly: false, // フロントエンドからもアクセス可能
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.json({ success: true, userName: name.trim() });
});

// ログイン状態確認
app.get('/api/check-login', (req, res) => {
  const userName = req.cookies.userName;
  
  if (userName) {
    res.json({ loggedIn: true, userName });
  } else {
    res.json({ loggedIn: false });
  }
});

// ログアウト
app.post('/api/logout', (req, res) => {
  res.clearCookie('userName');
  res.json({ success: true });
});

// 投稿作成
app.post('/api/posts', (req, res) => {
  const { content } = req.body;
  const userName = req.cookies.userName;
  
  if (!userName) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: '投稿内容を入力してください' });
  }
  
  if (content.length > 50) {
    return res.status(400).json({ error: '投稿は50文字以内で入力してください' });
  }
  
  const stmt = db.prepare('INSERT INTO posts (author, content) VALUES (?, ?)');
  stmt.run(userName, content.trim(), function(err) {
    if (err) {
      return res.status(500).json({ error: '投稿の保存に失敗しました' });
    }
    
    res.json({ 
      success: true, 
      post: {
        id: this.lastID,
        author: userName,
        content: content.trim(),
        created_at: new Date().toISOString()
      }
    });
  });
  stmt.finalize();
});

// タイムライン取得（最新1000件）
app.get('/api/posts', (req, res) => {
  db.all(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT 1000',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: '投稿の取得に失敗しました' });
      }
      
      const posts = rows.map(row => ({
        id: row.id,
        author: row.author,
        content: row.content,
        date: new Date(row.created_at).toLocaleDateString('ja-JP', { 
          month: 'long', 
          day: 'numeric' 
        }),
        time: new Date(row.created_at).toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        created_at: row.created_at
      }));
      
      res.json({ posts });
    }
  );
});

// ルートパスでHTMLファイルを提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

module.exports = app;
