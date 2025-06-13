import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Navbar = () => {
  const { isAuthenticated, authChecked, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login?logout=true");
    setMenuOpen(false);
  };

  if (!authChecked) return null;

  return (
    <>
      <div className="navbar">
        {/* PC nézetben ezek látszanak, mobilon hamburger menübe kerül */}
        {!isAuthenticated && !menuOpen && (
          <Link to="/login">
            <button className="login-button">Bejelentkezés</button>
          </Link>
        )}
        {isAuthenticated && !menuOpen && (
          <Link to="/login?logout=true">
            <button onClick={handleLogout} className="login-button">Kijelentkezés</button>
          </Link>
        )}
        <nav className="navbar-inner">
          <h1>City Cinema</h1>

          {/* PC nézetben linkek itt, mobilon el vannak rejtve */}
          <div className="links">
            {isAuthenticated && (
              <>
                <Link to="/feltoltottfilmek">Film feltöltés</Link>
                <Link to="/feltoltes">Feltöltés</Link>
              </>
            )}
            <Link to="/">Kezdőlap</Link>
            <Link to="/filmek">Filmek</Link>
          </div>
          {/* Hamburger + menü wrapper */}
          <div className="hamburger-wrapper">
            <button
              className="hamburger"
              aria-label="Menü"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>

            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="login-button">Kijelentkezés</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <button className="login-button">Bejelentkezés</button>
                </Link>
              )}

              {isAuthenticated && (
                <>
                  <Link to="/feltoltottfilmek" onClick={() => setMenuOpen(false)}>Film feltöltés</Link>
                  <Link to="/feltoltes" onClick={() => setMenuOpen(false)}>Feltöltés</Link>
                </>
              )}
              <Link to="/" onClick={() => setMenuOpen(false)}>Kezdőlap</Link>
              <Link to="/filmek" onClick={() => setMenuOpen(false)}>Filmek</Link>
            </div>
          </div> 
        </nav>
        {/* Kosár ikon kívül, PC-n így is marad */}
        <Link to="/kosar" className="cart-icon" title="Kosár">
          <i className="fas fa-shopping-cart"></i>
        </Link>

        
      </div>
    </>
  );
};

export default Navbar;
