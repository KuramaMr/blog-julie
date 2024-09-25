import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importer la méthode
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom'; // Importer useNavigate
import './AuthForms.css';
import { toast } from 'react-toastify';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Initialiser useNavigate

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Ajouter l'utilisateur à Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                isAdmin: false // Par défaut, l'utilisateur n'est pas administrateur
            });

            toast.success('Inscription réussie !', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate('/'); // Rediriger vers la page d'accueil
        } catch (error) {
            toast.error(error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSignup}>
                <h2>Inscription</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">S'inscrire</button>
                <Link to="/login" className="auth-link">Déjà un compte ? Se connecter</Link>
            </form>
        </div>
    );
}

export default Signup;