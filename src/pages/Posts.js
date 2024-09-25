import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Posts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const postsCollection = collection(db, 'posts');
            const postSnapshot = await getDocs(postsCollection);
            const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    return (
        <div>
            <h1>Posts</h1>
            {posts.length === 0 ? (
                <p>Aucun post disponible.</p>
            ) : (
                <ul>
                    {posts.map(post => (
                        <li key={post.id}>
                            <h2>{post.title}</h2>
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            <p><em>Publié le {post.createdAt.toDate().toLocaleString()}</em></p>
                            <button onClick={() => handleDelete(post.id)}>Supprimer</button> {/* Bouton de suppression */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Posts;