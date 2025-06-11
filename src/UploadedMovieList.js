import React, { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import useFetch from './useFetch';
import UploadedMovie from './UploadedMovie';


const UploadedMovieList = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const navigate = useNavigate();

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

    const token = localStorage.getItem("token");
    const { data: movies, isPending, error } = useFetch(
        `${process.env.REACT_APP_API_URL}/movies`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!authChecked) return null;

    return ( 
        <div className="uploaded-movies">
            { error && <div>{ error }</div>}
            { isPending && <div>Betöltés...</div>}
            { movies && <UploadedMovie movie={movies}/> }
        </div>
    );
};
 
export default UploadedMovieList;