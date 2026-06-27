const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// База данных (пока в памяти)
let users = []; // { id, username, password, avatar }
let posts = []; // { id, userId, image, text, likes: [], comments: [], createdAt }
let messages = []; // { id, fromUserId, toUserId, text, createdAt }

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.json({ success: false, error: 'Пользователь уже существует' });
  }
  
  const newUser = { id: Date.now().toString(), username, password, avatar: '' };
  users.push(newUser);
  res.json({ success: true, user: { id: newUser.id, username } });
});

// Вход
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.json({ success: false, error: 'Неверный логин или пароль' });
  }
  
  res.json({ success: true, user: { id: user.id, username } });
});

// Список пользователей (для чатов)
app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username })));
});

// Лента постов
app.get('/api/posts', (req, res) => {
  const feed = posts.map(p => ({
    ...p,
    author: users.find(u => u.id === p.userId),
    likesCount: p.likes.length,
  })).sort((a,b) => b.createdAt - a.createdAt);
  res.json(feed);
});

// Создать пост
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

// Лайк
app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Не найдено' });
  
  const { userId } = req.body;
  post.likes.includes(userId) 
    ? post.likes = post.likes.filter(id => id !== userId)
    : post.likes.push(userId);
    
  res.json({ likes: post.likes.length });
});

// Отправить сообщение
app.post('/api/messages', (req, res) => {
  const { fromUserId, toUserId, text } = req.body;
  const newMessage = {
    id: Date.now().toString(),
    fromUserId,
    toUserId,
    text,
    createdAt: Date.now()
  };
  messages.push(newMessage);
  res.json({ success: true, message: newMessage });
});

// Получить переписку между двумя пользователями
app.get('/api/messages/:userId1/:userId2', (req, res) => {
  const { userId1, userId2 } = req.params;
  const chat = messages
    .filter(m => 
      (m.fromUserId === userId1 && m.toUserId === userId2) ||
      (m.fromUserId === userId2 && m.toUserId === userId1)
    )
    .sort((a, b) => a.createdAt - b.createdAt);
  res.json(chat);
});

// Получить список чатов пользователя
app.get('/api/chats/:userId', (req, res) => {
  const userId = req.params.userId;
  const userChats = [];
  
  messages.forEach(m => {
    if (m.fromUserId === userId || m.toUserId === userId) {
      const otherUserId = m.fromUserId === userId ? m.toUserId : m.fromUserId;
      if (!userChats.find(c => c.userId === otherUserId)) {
        const otherUser = users.find(u => u.id === otherUserId);
        if (otherUser) {
          userChats.push({
            userId: otherUser.id,
            username: otherUser.username,
            lastMessage: m.text
          });
        }
      }
    }
  });
  
  res.json(userChats);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));