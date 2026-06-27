const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

let users = [];
let posts = [];
let messages = [];
let notifications = []; // { id, userId, type, fromUserId, postId, text, read, createdAt }

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.json({ success: false, error: 'User already exists' });
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
    return res.json({ success: false, error: 'Wrong username or password' });
  }
  
  res.json({ success: true, user: { id: user.id, username } });
});

// Поиск пользователей
app.get('/api/users/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  const results = users
    .filter(u => u.username.toLowerCase().includes(q.toLowerCase()))
    .map(u => ({ id: u.id, username: u.username }))
    .slice(0, 20);
  
  res.json(results);
});

// Список пользователей (только часть, для "кого-то добавить")
app.get('/api/users', (req, res) => {
  const { exclude } = req.query;
  let list = users.map(u => ({ id: u.id, username: u.username }));
  if (exclude) {
    list = list.filter(u => u.id !== exclude);
  }
  res.json(list.slice(0, 10));
});

// Лента
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

// Лайк + уведомление
app.post('/api/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  
  const { userId } = req.body;
  
  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
    // Уведомление автору поста
    if (post.userId !== userId) {
      const liker = users.find(u => u.id === userId);
      notifications.push({
        id: Date.now().toString(),
        userId: post.userId,
        type: 'like',
        fromUserId: userId,
        postId: post.id,
        text: `${liker?.username || 'Someone'} liked your post`,
        read: false,
        createdAt: Date.now()
      });
    }
  }
  
  res.json({ likes: post.likes.length });
});

// Отправить сообщение + уведомление
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
  
  // Уведомление получателю
  const sender = users.find(u => u.id === fromUserId);
  notifications.push({
    id: Date.now().toString() + '_msg',
    userId: toUserId,
    type: 'message',
    fromUserId,
    text: `${sender?.username || 'Someone'} sent you a message`,
    read: false,
    createdAt: Date.now()
  });
  
  res.json({ success: true, message: newMessage });
});

// Получить переписку
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

// Чаты пользователя
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

// Уведомления
app.get('/api/notifications/:userId', (req, res) => {
  const userNotes = notifications
    .filter(n => n.userId === req.params.userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);
  res.json(userNotes);
});

// Прочитать уведомления
app.post('/api/notifications/:userId/read', (req, res) => {
  notifications.forEach(n => {
    if (n.userId === req.params.userId) n.read = true;
  });
  res.json({ success: true });
});

// Количество непрочитанных
app.get('/api/notifications/:userId/count', (req, res) => {
  const count = notifications.filter(n => n.userId === req.params.userId && !n.read).length;
  res.json({ count });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));