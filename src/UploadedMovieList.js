import React, { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import useFetch from './useFetch';
import UploadedMovie from './UploadedMovie';


const UploadedMovieList = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3001/check-auth', {
        credentials: 'include',
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

    const { data: movies, isPending, error } = useFetch('http://localhost:3001/movies');

    if (!authChecked) return null;
    return ( 
        <div className="uploaded-movies">
            { error && <div>{ error }</div>}
            { isPending && <div>Betöltés...</div>}
            { movies && <UploadedMovie movie={movies}/>}
        </div>
    );
}
 
export default UploadedMovieList;