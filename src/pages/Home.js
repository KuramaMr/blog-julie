import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import './Home.css';

function Home({ user, isAdmin }) {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const postsPerPage = 5; // Nombre de posts par page

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            setLoadingProgress(0);
            const startTime = Date.now();
            const minLoadingTime = 1000; // Temps minimum de chargement en ms

            const updateProgress = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min((elapsedTime / minLoadingTime) * 100, 100);
                setLoadingProgress(progress);
                if (elapsedTime < minLoadingTime) {
                    requestAnimationFrame(updateProgress);
                }
            };

            requestAnimationFrame(updateProgress);

            try {
                const postsCollection = collection(db, 'posts');
                const q = query(postsCollection, orderBy('createdAt', 'desc'));
                const postSnapshot = await getDocs(q);
                const postList = await Promise.all(postSnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    if (data.isLongPost) {
                      const storageRef = ref(storage, data.content);
                      try {
                        const url = await getDownloadURL(storageRef);
                        const response = await fetch(url);
                        const text = await response.text();
                        data.content = text.replace(/\S+/g, word => word + ' ').trim();
                      } catch (error) {
                        console.error("Erreur lors de la récupération du contenu:", error);
                        data.content = "Erreur de chargement du contenu";
                      }
                    } else {
                      data.content = data.content.replace(/\S+/g, word => word + ' ').trim();
                    }
                    return { id: doc.id, ...data };
                }));

                // Attendre que le temps minimum soit écoulé avant d'afficher les posts
                const timeElapsed = Date.now() - startTime;
                if (timeElapsed < minLoadingTime) {
                    await new Promise(resolve => setTimeout(resolve, minLoadingTime - timeElapsed));
                }

                setPosts(postList);
            } catch (error) {
                console.error("Erreur lors de la récupération des posts:", error);
            } finally {
                setIsLoading(false);
                setLoadingProgress(100);
            }
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
                {isLoading ? (
                    <div className="loading">
                        <p>Chargement des posts...</p>
                        <div className="loading-bar-container">
                            <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                    </div>
                ) : currentPosts.length === 0 ? (
                    <p>Aucun post disponible.</p>
                ) : (
                    <>
                        <ul>
                            {currentPosts.map(post => (
                                <li key={post.id}>
                                    <h3>{post.title}</h3>
                                    {post.country && <p>Pays : {post.country}</p>}
                                    {post.travelDate && <p>Date du voyage : {post.travelDate.toDate().toLocaleDateString()}</p>}
                                    <p>{post.description}</p> {/* Affichage de la description au lieu du contenu */}
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