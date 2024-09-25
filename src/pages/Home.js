import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import './Home.css';

function Home({ user, isAdmin }) {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5; // Nombre de posts par page

    useEffect(() => {
        const fetchPosts = async () => {
            const postsCollection = collection(db, 'posts');
            const q = query(postsCollection, orderBy('createdAt', 'desc'));
            const postSnapshot = await getDocs(q);
            const postList = await Promise.all(postSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                if (data.isLongPost) {
                    const storageRef = ref(storage, data.content);
                    const url = await getDownloadURL(storageRef);
                    const response = await fetch(url);
                    const text = await response.text();
                    data.content = text;
                }
                return { id: doc.id, ...data };
            }));
            setPosts(postList);
        };

        fetchPosts();
    }, []);


    // Calculer les index des posts à afficher
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    // Changer de page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="home-container">
            <h1 className="home-title">Bienvenue sur mon blog</h1>
            {user ? (
                <div className="user-info">
                    <p>Connecté en tant que : {user.email}</p>
                </div>
            ) : (
                <div className="guest-info">
                    <Link className="signup-link" to="/signup">S'inscrire</Link> | <Link className="login-link" to="/login">Se connecter</Link>
                </div>
            )}
            <div className="posts-summary">
                <h2 className="posts-summary-title">Résumé des Posts</h2>
                {currentPosts.length === 0 ? (
                    <p>Aucun post disponible.</p>
                ) : (
                    <>
                        <ul>
                            {currentPosts.map(post => (
                                <li key={post.id}>
                                    <h3>{post.title}</h3>
                                    {post.country && <p>Pays : {post.country}</p>}
                                    {post.travelDate && <p>Date du voyage : {post.travelDate.toDate().toLocaleDateString()}</p>}
                                    <p>{post.content.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                                    <p className="post-meta">Publié le {post.createdAt.toDate().toLocaleString()}</p>
                                    <Link to={`/posts/${post.id}`}>Lire la suite</Link>
                                    
                                </li>
                            ))}
                        </ul>
                        <div className="pagination">
                            {Array.from({ length: Math.ceil(posts.length / postsPerPage) }, (_, i) => (
                                <button key={i} onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;