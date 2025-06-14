import React from 'react'
import { useParams, Link } from "react-router-dom";
import useFetch from "./useFetch";

const MovieDetails = () => {
  const { link } = useParams();
  const { data: film, error, isPending } = useFetch(`${process.env.REACT_APP_API_URL}/movies/` + link);

  return (
    <div className="movie-details">
      {isPending && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {film && (
        <>
        <article className="movie-card pc-alt">
          <h2 className="movie-title">{film.title}</h2>
          <div className="image-desc">
            <img src={film.image} alt={film.title} className="details-image"/>
            <div className="description-container">
              <h3 className="cast-title">Szereplők</h3>
              <div className="cast-and-button">
                <ul className="cast-list">
                  {film.cast.split(',').map((name, index) => (
                    <li key={index}>{name.trim()}</li>
                  ))}
                </ul>
                <div className="button-container">
                <Link to={`/filmek/${film.link}/foglalas`} state={{ film }}>
                  <button className="ticket-booking">Jegyfoglalás!</button>
                </Link>
              </div>
              </div>
              <h3 className="description-title">Leírás</h3>
              <p className="description">{film.description}</p>
            </div>
          </div>
        </article>
        <article className="movie-card mobile-alt">
          <h2 className="movie-title">{film.title}</h2>
          <div className="image-desc">
            <img src={film.image} alt={film.title} className="details-image" />

            <div className="description-container-mobile">
              <h3 className="description-title">Leírás</h3>
              <p className="description">{film.description}</p>

              <div className="button-container">
                <Link to={`/filmek/${film.link}/foglalas`} state={{ film }}>
                  <button className="ticket-booking">Jegyfoglalás!</button>
                </Link>
              </div>

              <h3 className="cast-title">Szereplők</h3>
              <ul className="cast-list">
                {film.cast.split(',').map((name, index) => (
                  <li key={index}>{name.trim()}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
        </>
      )}
    </div>
  );
  
  
  
};

export default MovieDetails;
