import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Градиенты для аватарок
const gradients = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-pink-500',
];

function getGradient(name) {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

// Страница входа
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const url = isLogin ? '/api/login' : '/api/register';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg shadow-indigo-200">
            💬
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome back' : 'Join us'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-500 p-3 rounded-2xl mb-4 text-sm text-center"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 transition"
              required
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-indigo-500 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

// Карточка поста
function PostCard({ post, onLike, currentUser }) {
  const [liked, setLiked] = useState(post.likes.includes(currentUser?.id));
  const [likeCount, setLikeCount] = useState(post.likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike(post.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-3xl shadow-sm p-5 mb-4 border border-gray-100/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 bg-gradient-to-br ${getGradient(post.author?.username || 'A')} rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
          {post.author?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <span className="font-semibold text-gray-800">{post.author?.username || 'Anon'}</span>
          <p className="text-xs text-gray-400">Just now</p>
        </div>
      </div>
      
      {post.image && (
        <img src={post.image} className="rounded-2xl mb-4 w-full object-cover max-h-96" alt="post" />
      )}
      <p className="text-gray-700 mb-4 leading-relaxed">{post.text}</p>
      
      <div className="flex gap-4 pt-3 border-t border-gray-50">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-medium transition ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
          {likeCount > 0 && <span>{likeCount}</span>}
        </motion.button>
        
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition font-medium">
          <span className="text-lg">💬</span>
          Comment
        </button>
        
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition font-medium ml-auto">
          <span className="text-lg">↗️</span>
          Share
        </button>
      </div>
    </motion.div>
  );
}

// Форма создания поста
function CreatePost({ onPostCreated, userId, user }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text, image: '' })
    });
    
    setText('');
    onPostCreated();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl shadow-sm p-5 mb-6 border transition ${
        isFocused ? 'border-indigo-200 shadow-md' : 'border-gray-100/50'
      }`}
    >
      <div className="flex gap-3">
        <div className={`w-11 h-11 bg-gradient-to-br ${getGradient(user?.username || 'A')} rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg flex-shrink-0`}>
          {user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What's on your mind?"
            className="w-full p-0 border-0 resize-none focus:outline-none text-gray-700 placeholder-gray-400 text-sm"
            rows="2"
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
            <div className="flex gap-2">
              <span className="text-xl cursor-pointer hover:scale-110 transition">📷</span>
              <span className="text-xl cursor-pointer hover:scale-110 transition">🎵</span>
              <span className="text-xl cursor-pointer hover:scale-110 transition">📍</span>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={!text.trim()}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
                text.trim() 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              Post
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// Список чатов
function ChatsPage({ userId }) {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/chats/${userId}`)
      .then(r => r.json())
      .then(setChats);
  }, [userId]);

  return (
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Messages</h2>
      {chats.map((chat, i) => (
        <motion.div
          key={chat.userId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => navigate(`/chat/${chat.userId}`)}
          className="bg-white rounded-2xl shadow-sm p-4 mb-3 border border-gray-100/50 cursor-pointer hover:shadow-md transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradient(chat.username)} rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
              {chat.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{chat.username}</span>
                <span className="text-xs text-gray-400">Now</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
            </div>
            <span className="text-gray-300">›</span>
          </div>
        </motion.div>
      ))}
      {chats.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">💬</span>
          <p className="text-gray-400">No messages yet</p>
          <p className="text-gray-300 text-sm mt-1">Find users to start chatting</p>
        </div>
      )}
    </div>
  );
}

// Один чат
function ChatPage({ userId, chatUserId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const messagesEndRef = useState(null);

  useEffect(() => {
    fetch(`/api/users`)
      .then(r => r.json())
      .then(users => setChatUser(users.find(u => u.id === chatUserId)));

    const loadMessages = () => {
      fetch(`/api/messages/${userId}/${chatUserId}`)
        .then(r => r.json())
        .then(setMessages);
    };
    
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [userId, chatUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId: userId, toUserId: chatUserId, text })
    });

    setText('');
    const res = await fetch(`/api/messages/${userId}/${chatUserId}`);
    setMessages(await res.json());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <Link to="/chats" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <div className={`w-9 h-9 bg-gradient-to-br ${getGradient(chatUser?.username || 'A')} rounded-xl flex items-center justify-center font-bold text-white`}>
          {chatUser?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="font-semibold text-gray-800">{chatUser?.username || 'Chat'}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.fromUserId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] p-4 rounded-3xl ${
              msg.fromUserId === userId 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-lg shadow-lg shadow-indigo-200' 
                : 'bg-white text-gray-800 rounded-bl-lg shadow-sm border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 p-4 flex gap-3">
        <button type="button" className="text-2xl text-gray-400">😀</button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
        />
        <motion.button 
          whileTap={{ scale: 0.9 }}
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 rounded-2xl font-semibold shadow-lg shadow-indigo-200"
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}

// Список пользователей
function UsersPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers);
  }, []);

  return (
    <div className="px-4 pt-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Discover People</h2>
      <div className="space-y-2">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/chat/${user.id}`)}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100/50 cursor-pointer hover:shadow-md transition active:scale-[0.98] flex items-center gap-3"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradient(user.username)} rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <span className="font-semibold text-gray-800">{user.username}</span>
              <p className="text-xs text-gray-400">Tap to message</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-200"
            >
              Chat
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Главный компонент
export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      setPosts(await res.json());
    } catch (err) {}
  };

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleLike = async (postId) => {
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    fetchPosts();
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    flex flex-col items-center gap-1 transition
    ${isActive(path) ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-600'}
  `;

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="bg-gray-50 min-h-screen max-w-lg mx-auto relative pb-20">
      {/* Шапка */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-5 py-4 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          {location.pathname === '/chats' ? 'Messages' : 
           location.pathname === '/users' ? 'People' :
           location.pathname === '/profile' ? 'Profile' : 'My Net'}
        </h1>
        <button 
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition px-3 py-1 rounded-xl hover:bg-red-50"
        >
          Exit
        </button>
      </div>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <div className="px-4 pt-4">
              <CreatePost onPostCreated={fetchPosts} userId={user.id} user={user} />
              {posts.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} currentUser={user} />
              ))}
            </div>
          } />
          <Route path="/chats" element={<ChatsPage userId={user.id} />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/chat/:chatUserId" element={
            <ChatPage userId={user.id} chatUserId={location.pathname.split('/')[2]} />
          } />
          <Route path="/profile" element={
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <div className={`w-24 h-24 bg-gradient-to-br ${getGradient(user.username)} rounded-3xl flex items-center justify-center text-4xl font-bold text-white mx-auto shadow-2xl mb-4`}>
                {user.username[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
              <p className="text-gray-400 mt-1">@ {user.username.toLowerCase()}</p>
              <div className="flex justify-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{posts.filter(p => p.userId === user.id).length}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">0</div>
                  <div className="text-xs text-gray-400">Friends</div>
                </div>
              </div>
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>

      {/* Нижнее меню */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-4 rounded-t-3xl shadow-lg">
        <Link to="/" className={navLinkClass('/')}>
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-semibold">Feed</span>
        </Link>
        <Link to="/users" className={navLinkClass('/users')}>
          <span className="text-2xl">👥</span>
          <span className="text-[10px] font-semibold">People</span>
        </Link>
        <Link to="/chats" className={navLinkClass('/chats')}>
          <span className="text-2xl">💬</span>
          <span className="text-[10px] font-semibold">Chats</span>
        </Link>
        <Link to="/profile" className={navLinkClass('/profile')}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}