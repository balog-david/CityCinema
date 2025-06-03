import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.removeItem('isLoggedIn');
        navigate('/login?logout=true');
      } else {
        alert('Kijelentkezés sikertelen');
      }
    })
    .catch(err => {
      console.error('Logout hiba:', err);
      alert('Hiba történt a kijelentkezés során');
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (!storedToken) return;
    fetch(`${process.env.REACT_APP_API_URL}/tickets/${storedToken}`)
      .then(res => res.json())
      .then(data => {
        if(!data.reservedSeatsCount) {
          localStorage.removeItem('reservations');
        }
      })
      .catch(err => console.error("Hiba a jegyek lekérésekor:", err));
  }, []);

  return (
    <>
      <div className="login-button-container">
        {!isLoggedIn && (
          <Link to="/login">
            <button className="login-button">Bejelentkezés</button>
          </Link>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout} className="login-button">Kijelentkezés</button>
        )}
      </div>

      <nav className="navbar">
        <h1>City Cinema</h1>
        <div className="links">
          {isLoggedIn && (
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
