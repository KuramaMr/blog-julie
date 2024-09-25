import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AddPost from './pages/AddPost';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail'; 
import SearchPosts from './pages/SearchPosts'; 
import Navbar from './pages/Navbar'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                const userDoc = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDoc);
                    if (userSnapshot.exists()) {
                    setIsAdmin(userSnapshot.data().isAdmin); 
                } else {
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <Navbar user={user} isAdmin={isAdmin} /> 
            <Routes> 
                <Route path="/" element={<Home user={user} isAdmin={isAdmin} />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} /> 
                <Route path="/add-post" element={<AddPost isAdmin={isAdmin} />} /> 
                <Route path="/posts" element={<Posts />} /> 
                <Route path="/posts/:postId" element={<PostDetail isAdmin={isAdmin} />} /> 
                <Route path="/search-posts" element={<SearchPosts />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </Router>
    );
}

export default App;