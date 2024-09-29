import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css'; // Utiliser le thème "bubble" pour l'affichage
import './PostDetail.css';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import EditorToolbar, { modules, formats } from "../components/EditorToolbar";

function PostDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [country, setCountry] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [description, setDescription] = useState('');

    useEffect(() => {
        const saveScrollPosition = () => {
            setScrollPosition(window.pageYOffset);
        };
    
        window.addEventListener('scroll', saveScrollPosition);
    
        return () => {
            window.removeEventListener('scroll', saveScrollPosition);
        };
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) {
                return;
            }

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
                const docRef = doc(db, "posts", postId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const postData = docSnap.data();
                    setTitle(postData.title);
                    setTravelDate(postData.travelDate.toDate().toLocaleDateString());
                    setCountry(postData.country);
                    setDescription(postData.description || ''); // Ajout de la description

                    if (postData.isLongPost) {
                        const storageRef = ref(storage, postData.content);
                        const url = await getDownloadURL(storageRef);
                        const response = await fetch(url);
                        const text = await response.text();
                        setContent(text.replace(/\S+/g, word => word + ' ').trim());
                    } else {
                        setContent(postData.content.replace(/\S+/g, word => word + ' ').trim());
                    }
                    setPost(postData);
                } else {
                    console.log("No such document!");
                    navigate('/');
                }

                const timeElapsed = Date.now() - startTime;
                if (timeElapsed < minLoadingTime) {
                    await new Promise(resolve => setTimeout(resolve, minLoadingTime - timeElapsed));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du post:", error);
            } finally {
                setIsLoading(false);
                setLoadingProgress(100);
            }
        };

        fetchPost();
    }, [postId, navigate]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
                    if (docSnap.exists()) {
                        const isUserAdmin = docSnap.data().role === 'admin';
                        setIsAdmin(isUserAdmin);
                    } else {
                        setIsAdmin(false);
                    }
                });
            } else {
                setIsAdmin(false);
            }
        });
    
        return () => unsubscribe();
    }, []);

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
            try {
                await deleteDoc(doc(db, 'posts', postId));
                toast.success('Post supprimé avec succès !', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                navigate('/');
            } catch (error) {
                toast.error('Erreur lors de la suppression du post : ' + error.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            let contentRef = content;
    
            // Si le contenu dépasse 900000 octets (pour laisser de la marge), on le stocke dans Storage
            if (new Blob([content]).size > 900000) {
                const storageRef = ref(storage, `posts/${new Date().getTime()}.txt`);
                await uploadString(storageRef, content);
                contentRef = await getDownloadURL(storageRef);
            }
    
            await updateDoc(doc(db, 'posts', postId), {
                title: title,
                content: contentRef,
                travelDate: new Date(travelDate),
                country: country,
                description: description, // Ajout de la description
                isLongPost: new Blob([content]).size > 900000
            });
    
            toast.success('Post mis à jour avec succès !', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsEditing(false);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du post : ' + error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="post-detail-chargement">
                <p>Chargement du post...</p>
                <div className="loading-bar-container">
                    <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
                </div>
            </div>
        );
    }
    
    if (!post) {
        return <div className="post-detail-chargement"><p>Post non trouvé</p></div>;
    }

    if (isEditing) {
        return (
            <div className="post-detail-container">
                <h1>Modifier le post</h1>
                <form onSubmit={handleUpdate}>
                    <input
                        className="edit-container"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        required
                    />
                    <input
                        className="edit-container"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description courte du voyage"
                        name="description"
                    />
                    <div className="editor-container" ref={editorRef}>
                        <div className="floating-toolbar">
                            <EditorToolbar />
                        </div>
                        <ReactQuill
                            value={content}
                            onChange={(value) => {
                                setContent(value);
                                setTimeout(() => window.scrollTo(0, scrollPosition), 0);
                            }}
                            theme="snow"
                            modules={modules}
                            formats={formats}
                        />
                    </div>
                    <button type="submit">Enregistrer les modifications</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Annuler</button>
                </form>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <h1 className="post-detail-title">{post.title}</h1>
            <p className="post-detail-info">
                {post.country && `Pays : ${post.country}`}
                {post.country && post.travelDate && ' | '}
                {post.travelDate && `Date du voyage : ${post.travelDate.toDate().toLocaleDateString()}`}
            </p>
            <p className="post-detail-description">{post.description}</p>
            <ReactQuill
                value={content}
                readOnly={true}
                theme="bubble"
                modules={{ toolbar: false }}
            />
            <p className="post-detail-date">Publié le {post.createdAt.toDate().toLocaleString()}</p>
            {isAdmin && (
                <>
                <button onClick={handleDelete} className="delete-post-button">Supprimer le post</button>
                <button onClick={() => setIsEditing(true)} className="edit-post-button">Modifier le post</button>
                </>
            )}
        </div>
    );
}

export default PostDetail;