// mon-blog/src/pages/SearchPosts.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import './SearchPosts.css';

function SearchPosts() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('date');
    const [isAdmin] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            const postsCollection = collection(db, 'posts');
            const postSnapshot = await getDocs(postsCollection);
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

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'posts', id));
            setPosts(posts.filter(post => post.id !== id)); // Mettre à jour l'état pour retirer le post supprimé
            alert('Post supprimé avec succès !');
        } catch (error) {
            alert('Erreur lors de la suppression du post : ' + error.message);
        }
    };

    useEffect(() => {
        let filtered = posts;

        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (countryFilter) {
            filtered = filtered.filter(post => post.country === countryFilter);
        }

        if (dateFilter) {
            filtered = filtered.filter(post => post.travelDate.toDate().toLocaleDateString() === dateFilter);
        }

        if (sortOrder === 'date') {
            filtered = filtered.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        } else if (sortOrder === 'title') {
            filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredPosts(filtered);
    }, [searchTerm, countryFilter, dateFilter, sortOrder, posts]);

    return (
        <div className="search-posts-container">
            <h1 className="search-title">Rechercher des Posts</h1>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Rechercher par titre ou contenu"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Filtrer par pays"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Filtrer par date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
                <label>
                    Trier par :
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="date">Date</option>
                        <option value="title">Titre</option>
                    </select>
                </label>
            </div>
            <div className="posts-summary">
                {filteredPosts.length === 0 ? (
                    <p>Aucun post trouvé.</p>
                ) : (
                    <ul>
                        {filteredPosts.map(post => (
                            <li key={post.id} className="post-item">
                                <h3>{post.title}</h3>
                                <p>
                                    {post.country && `Pays : ${post.country}`}
                                    {post.country && post.travelDate && ' | '}
                                    {post.travelDate && `Date du voyage : ${post.travelDate.toDate().toLocaleDateString()}`}
                                </p>
                                <p>{post.content.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                                <p><em>Publié le {post.createdAt.toDate().toLocaleString()}</em></p>
                                <Link to={`/posts/${post.id}`} className="read-more-link">Lire la suite</Link>
                                {isAdmin && (
                                    <button onClick={() => handleDelete(post.id)}>Supprimer</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SearchPosts;