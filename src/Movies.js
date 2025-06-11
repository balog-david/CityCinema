import React from 'react'

import AllFilms from "./AllFilms";
import useFetch from "./useFetch";


const Movies = () => {
    const { data:films, isPending_1, error_1 } = useFetch(`${process.env.REACT_APP_API_URL}/movies`);
    const { data:screenings, isPending_2, error_2}  = useFetch(`${process.env.REACT_APP_API_URL}/screenings`)
    
    return (
        <div className="movies">
            {(error_1 || error_2) && <div>{ error_1 }</div>}
            {(isPending_1 || isPending_2) && <div>Betöltés...</div>}
            {films && <AllFilms films={films} screenings={screenings} title="Összes film!" />}
        </div>
    );
}

export default Movies;