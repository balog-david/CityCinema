import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';

const UploadedMovie = ({ movie }) => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        if (Array.isArray(movie)) {
            setMovies(movie);
        }
    }, [movie]);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/movies/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error('Hiba történt a törlés közben!');
            setMovies((prev) => prev.filter((m) => m._id !== id));
        } catch (error) {
            console.error("Törlés sikertelen:", error);
        }
    };

    return (
        <div>
        <h1 className="uploaded-movies-h1">Feltöltött filmek</h1>
        <div className="uploaded-movies-container">
            {movies.length === 0 ? (
                <p></p>
            ) : (
                movies.map((movie) => (
                    <div className="movies" key={movie._id}>
                        <h2>{movie.title}</h2>
                        <div className="image-wrapper">
                            <img src={movie.image} alt={movie.title} className="uploaded-image"/>
                            <div className="buttons">
                                <Link to="/filmfeltoltes" state={{ movie }}>
                                    <button>✎</button>
                                </Link>
                                <button onClick={() => handleDelete(movie._id)}>X</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div className="upload-wrapper">
                <Link to="/filmfeltoltes" state={{ movie }}><button className="upload-button">+</button></Link>
            </div>
        </div>
        </div>
    );
};

UploadedMovie.propTypes = {
    movie: PropTypes.array.isRequired,
};

export default UploadedMovie;
