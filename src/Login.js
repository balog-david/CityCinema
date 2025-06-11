import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Ha már be vagyunk jelentkezve, irányítson haza
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Ha logout query param van, törölje a tokent és irányítson haza
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('logout') === 'true') {
            localStorage.removeItem('token');
            navigate('/');
        }
    }, [location.search, navigate]);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.username.trim() || !formData.password.trim()) {
            alert("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.token) {
                    login(data.token); // 🔁 Meghívjuk a context-ben definiált login-t
                    setFormData({ username: "", password: "" });
                    navigate('/');
                } else {
                    alert('Helytelen felhasználónév vagy jelszó.');
                }
            })
            .catch(err => {
                console.error("Hiba a bejelentkezés során:", err);
                alert("Hiba történt a bejelentkezés során. Kérlek próbáld újra.");
            });
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Felhasználónév"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Jelszó"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Bejelentkezés</button>
            </form>
        </div>
    );
};

export default Login;
