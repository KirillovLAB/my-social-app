import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function PostCard({ post, onLike }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
          {post.author?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="font-semibold text-gray-800">{post.author?.username || 'Аноним'}</span>
      </div>
      
      {post.image && (
        <img src={post.image} className="rounded-xl mb-3 w-full object-cover max-h-96" alt="post" />
      )}
      <p className="text-gray-700 mb-3">{post.text}</p>
      
      <button 
        onClick={() => onLike(post.id)} 
        className="flex items-center gap-2 text-red-400 hover:text-red-600 transition active:scale-90"
      >
        ?? <span className="text-sm font-medium">{post.likesCount}</span>
      </button>
    </motion.div>
  );
}

function CreatePost({ onPostCreated }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user', text, image: '' })
    });
    
    setText('');
    onPostCreated();
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Что нового?"
        className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
        rows="3"
      />
      <button 
        type="submit"
        className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition active:scale-95"
      >
        Опубликовать
      </button>
    </motion.form>
  );
}

export default function App() {
  const location = useLocation();
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.log('Сервер не доступен');
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId) => {
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user' })
    });
    fetchPosts();
  };

  return (
    <div className="bg-gray-50 min-h-screen max-w-lg mx-auto relative pb-24">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-5 py-4 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Моя Сеть</h1>
      </div>

      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <>
                <CreatePost onPostCreated={fetchPosts} />
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onLike={handleLike} />
                ))}
              </>
            } />
            <Route path="/profile" element={
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400"
              >
                ?? Профиль (скоро)
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-lg border-t border-gray-200 flex justify-around py-3">
        <Link to="/" className="flex flex-col items-center text-indigo-600">
          <span className="text-xl">??</span>
          <span className="text-xs font-medium">Лента</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-400">
          <span className="text-xl">??</span>
          <span className="text-xs font-medium">Профиль</span>
        </Link>
      </nav>
    </div>
  );
}