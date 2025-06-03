import React from 'react'
import LatestFilms from "./LatestFilms";
import useFetch from "./useFetch";

const Home = () => {
    const { data:films, isPending, error } = useFetch(`${process.env.REACT_APP_API_URL}/movies`);
    return (
        <div className="home">
            {error && <div>{ error }</div>}
            {isPending && <div>Betöltés...</div>}
            {films && films.length!==0 && <LatestFilms films={films} title="Legújabbak a vásznon!" />}
        </div>
    );
}
 
export default Home;