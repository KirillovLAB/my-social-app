const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

let users = [];
let posts = [];

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  users.push({ id: Date.now().toString(), username, password, avatar: '' });
  res.json({ success: true, user: { id: users[users.length-1].id, username } });
});

app.get('/api/posts', (req, res) => {
  const feed = posts.map(p => ({
    ...p,
    author: users.find(u => u.id === p.userId),
    likesCount: p.likes.length,
  })).sort((a,b) => b.createdAt - a.createdAt);
  res.json(feed);
});

app.post('/api/posts', (req, res) => {
  const { userId, image, text } = req.body;
  const newPost = { 
    id: Date.now().toString(), 
    userId, 
    image, 
    text, 
    likes: [], 
    comments: [], 
    createdAt: Date.now() 
  };
  posts.push(newPost);
  res.json({ success: true, post: newPost });
});

app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Не найдено' });
  
  const { userId } = req.body;
  post.likes.includes(userId) 
    ? post.likes = post.likes.filter(id => id !== userId)
    : post.likes.push(userId);
    
  res.json({ likes: post.likes.length });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Сервер на порту ${PORT}`));