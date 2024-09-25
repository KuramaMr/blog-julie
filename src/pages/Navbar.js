// mon-blog/src/pages/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase'; // Importer auth
import './Navbar.css'; // Importer le fichier CSS pour le style
import { FaGlobeAmericas, FaBars, FaTimes } from 'react-icons/fa'; // Importez l'icône

function Navbar({ user, isAdmin }) {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [navRef]);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar" ref={navRef}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <FaGlobeAmericas /> Rêve d'Europe
                </Link>
                <div className="menu-icon" onClick={toggleMenu}>
                    {isOpen ? <FaTimes /> : <FaBars />}
                </div>
                <ul className={isOpen ? "navbar-menu active" : "navbar-menu"}>
                    <li><Link to="/" onClick={toggleMenu}>Accueil</Link></li>
                    <li><Link to="/search-posts" onClick={toggleMenu}>Rechercher des posts</Link></li>
                    {user ? (
                        <>
                            {isAdmin && (
                                <li><Link to="/add-post" onClick={toggleMenu}>Ajouter un post</Link></li>
                            )}
                            <li><button className="navbar-menu-button" onClick={() => { auth.signOut(); toggleMenu(); }}>Se déconnecter</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/signup" onClick={toggleMenu}>S'inscrire</Link></li>
                            <li><Link to="/login" onClick={toggleMenu}>Se connecter</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;