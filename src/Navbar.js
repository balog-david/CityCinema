import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Navbar = () => {
  const { isAuthenticated, authChecked, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login?logout=true");
  };

  if (!authChecked) return null;

  return (
    <>
      <div className="login-button-container">
        {!isAuthenticated && (
          <Link to="/login">
            <button className="login-button">Bejelentkezés</button>
          </Link>
        )}
        {isAuthenticated && (
          <button onClick={handleLogout} className="login-button">Kijelentkezés</button>
        )}
      </div>

      <nav className="navbar">
        <h1>City Cinema</h1>
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
      </nav>

      <Link to="/kosar" className="cart-icon" title="Kosár">
        <i className="fas fa-shopping-cart"></i>
      </Link>
    </>
  );
};

export default Navbar;
