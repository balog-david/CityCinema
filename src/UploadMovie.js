import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UploadMovie = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const location = useLocation();
    const [movie, setMovie] = useState({
        title: "",
        body: "",
        author: "",
        image: "",
        link: "",
        description: "",
        cast: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token"); // vagy sessionStorage

        fetch(`${process.env.REACT_APP_API_URL}/auth/check-auth`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
        })
        .then(data => {
        if (!data.loggedIn) {
            navigate('/login'); 
        } 
        })
        .catch(() => {
        navigate('/login');
        })
        .finally(() => {
        setAuthChecked(true);
        });
    }, [navigate]);

    useEffect(() => {
        if (location.state && location.state.movie) {
            setMovie(location.state.movie);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovie(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageFileChange = (e) => {
    const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setMovie(prev => ({
                ...prev,
                image: file.name
            }));
        } else {
            setImageFile(null);
            setMovie(prev => ({
                ...prev,
                image: ""
            }));
        }
    };


    const handleUpload = (e) => {
        e.preventDefault();
        const isEditing = Boolean(location.state && location.state.movie && location.state.movie._id);
        const requiredFields = ["title", "body", "author", "link", "description", "cast"];
        const hasEmptyField = requiredFields.some(field => String(movie[field] || "").trim() === "");

        if (hasEmptyField || !imageFile) {
            alert("Minden mező, beleértve a képet is, kötelező!");
            return;
        }

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("title", movie.title);
        formData.append("body", movie.body);
        formData.append("author", movie.author);
        formData.append("link", movie.link);
        formData.append("description", movie.description);
        formData.append("cast", movie.cast);

        const url = isEditing
            ? `${process.env.REACT_APP_API_URL}/movies/${movie._id}`
            : `${process.env.REACT_APP_API_URL}/movies`;

        const method = isEditing ? 'PATCH' : 'POST';

        fetch(url, {
            method,
            body: formData,
            credentials: 'include'
        })
        .then(res => res.json())
        .then(() => {
            alert(isEditing ? 'A film sikeresen frissítve!' : 'A film sikeresen feltöltve!');
            setMovie({
                title: "", body: "", author: "", image: "", link: "", description: "", cast: ""
            });
            setImageFile(null);
        })
        .catch(err => {
            console.error("Hiba a mentés során:", err);
            alert("Hiba történt a feltöltés/frissítés során!");
        });
    };

    if (!authChecked) return null;
    return (
        <form className="upload-form">
            <div className="form-group">
                <label htmlFor="movieTitle">Film címe:</label>
                <input
                    type="text"
                    id="movieTitle"
                    name="title"
                    className="form-input"
                    value={movie.title || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="movieBody">Film törzsszövege:</label>
                <textarea
                    id="movieBody"
                    name="body"
                    className="form-textarea"
                    value={movie.body || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="movieAuthor">Szerző:</label>
                <input
                    type="text"
                    id="movieAuthor"
                    name="author"
                    className="form-input"
                    value={movie.author || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="movieImage">Kép kiválasztása:</label>
                <input
                    type="file"
                    id="movieImage"
                    name="image"
                    className="form-input"
                    accept="image/*"
                    onChange={handleImageFileChange}
                />
                {movie.image && (
                    <p style={{ marginTop: "5px" }}>Kiválasztott fájl: <strong>{movie.image}</strong></p>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="movieLink">Film linkje:</label>
                <input
                    type="text"
                    id="movieLink"
                    name="link"
                    className="form-input"
                    value={movie.link || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="movieDescription">Leírás:</label>
                <textarea
                    id="movieDescription"
                    name="description"
                    className="form-textarea"
                    value={movie.description || ""}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="movieCast">Szereplők:</label>
                <input
                    type="text"
                    id="movieCast"
                    name="cast"
                    className="form-input"
                    value={movie.cast || ""}
                    onChange={handleChange}
                />
            </div>
            <button onClick={handleUpload}>Feltölt</button>
        </form>
    );
};

export default UploadMovie;
