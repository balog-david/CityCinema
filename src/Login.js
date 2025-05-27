import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetch('http://localhost:3001/check-auth', {
        credentials: 'include',
        })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            if (data.loggedIn) {
                navigate('/'); 
            } 
        })
        .catch(() => {
            navigate('/');
        })
        .finally(() => {
            setAuthChecked(false);
        });
    }, [navigate]);

    
    useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('logout') === 'true') {
        navigate('/');
    }
}, [location.search, navigate]);

    const handleChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
        alert("Kérlek, töltsd ki mindkét mezőt!");
        return;
    }

    fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            setFormData({username: "", password: ""});
            localStorage.setItem('isLoggedIn', 'true');
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

    if(authChecked) return null;

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

