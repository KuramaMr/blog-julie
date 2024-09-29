import React, { useState, useRef, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import EditorToolbar, { modules, formats } from "../components/EditorToolbar";
import './AddPost.css';
import { toast } from 'react-toastify';
import { ref, uploadString, getDownloadURL } from "firebase/storage";

const ImageUpload = ({ quillRef }) => {
    const inputRef = useRef(null);

    const handleImageUpload = () => {
        inputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 700;
                const scale = Math.min(MAX_WIDTH / img.width, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const resizedImage = canvas.toDataURL('image/jpeg');

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                if (range) {
                    quill.insertEmbed(range.index, 'image', resizedImage);
                } else {
                    const length = quill.getLength();
                    quill.insertEmbed(length, 'image', resizedImage);
                }
            };
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <button className='add-post-button' type="button" onClick={handleImageUpload}>Insérer une image</button>
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={inputRef}
                onChange={handleFileChange}
            />
        </>
    );
};

function AddPost({ isAdmin }) {
    const quillRef = useRef(null);
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [country, setCountry] = useState('');
    const [description, setDescription] = useState(''); // Nouveau champ
    const navigate = useNavigate();
    const [scrollPosition, setScrollPosition] = useState(0);

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
        window.scrollTo(0, scrollPosition);
    }, [content, scrollPosition]);

    useEffect(() => {
        const savedPost = JSON.parse(localStorage.getItem('savedPost'));
        if (savedPost) {
            setTitle(savedPost.title || '');
            setContent(savedPost.content || '');
            setTravelDate(savedPost.travelDate || '');
            setCountry(savedPost.country || '');
        }
    }, []);

    const saveToLocalStorage = useCallback(() => {
        const postToSave = { title, content, travelDate, country };
        localStorage.setItem('savedPost', JSON.stringify(postToSave));
        toast.info('Brouillon sauvegardé', {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    }, [title, content, travelDate, country]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            saveToLocalStorage();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [saveToLocalStorage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let contentRef = content;
            
            // Si le contenu dépasse 900000 octets (pour laisser de la marge), on le stocke dans Storage
            if (new Blob([content]).size > 900000) {
                const storageRef = ref(storage, `posts/${new Date().getTime()}.txt`);
                await uploadString(storageRef, content);
                contentRef = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'posts'), {
                title: title,
                content: contentRef,
                travelDate: new Date(travelDate),
                country: country,
                description: description, // Ajout de la description
                createdAt: new Date(),
                isLongPost: new Blob([content]).size > 900000
            });

            toast.success('Post ajouté avec succès !', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            localStorage.removeItem('savedPost');
            navigate('/');
            editorRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll vers l'éditeur
        } catch (error) {
            toast.error('Erreur lors de l\'ajout du post : ' + error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const formRef = useRef(null);

    if (!isAdmin) {
        return <p>Accès refusé. Vous n'êtes pas autorisé à ajouter des posts.</p>;
    }

    return (
        <div className="add-post-container" ref={formRef}>
            <h2>Ajouter un Post</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className='add-post-input'
                    type="text"
                    placeholder="Titre"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    className='add-post-input'
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    required
                />
                <input
                    className='add-post-input'
                    type="text"
                    placeholder="Pays"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Courte description du voyage"
                    required
                />
                <div className="editor-container" ref={editorRef}>
                    <div className="floating-toolbar">
                        <EditorToolbar />
                    </div>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={content}
                        onChange={(value) => {
                            setContent(value);
                            setTimeout(() => window.scrollTo(0, scrollPosition), 0);
                        }}
                        placeholder={"Écrivez quelque chose d'incroyable..."}
                        modules={modules}
                        formats={formats}
                    />
                </div>
                <ImageUpload quillRef={quillRef} />
                <button className='add-post-button' type="submit">Ajouter le post</button>
            </form>
            <button className='add-post-button' onClick={() => navigate('/')}>Retour à l'accueil</button>
        </div>
    );
}

export default AddPost;