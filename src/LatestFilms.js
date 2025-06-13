import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const LatestFilms = ({ films, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState([films[0]]);
    const trackRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const touchRef = useRef(null);

    const handleRightClick = useCallback(() => {
        const nextIndex = (currentIndex + 1) % films.length;
        setSlides(prev => [...prev, films[nextIndex]]);

        if (trackRef.current) {
            trackRef.current.style.transition = 'none';
            trackRef.current.style.transform = 'translateX(0)';
            
            // 🔧 Force reflow
            void trackRef.current.offsetHeight;

            // 🔄 Animáció beállítása
            trackRef.current.style.transition = 'transform 1s ease-in-out';
            trackRef.current.style.transform = 'translateX(-100%)';
        }

        setTimeout(() => {
            setSlides(prev => prev.slice(1));
            if (trackRef.current) {
                trackRef.current.style.transition = 'none';
                trackRef.current.style.transform = 'translateX(0)';
            }
            setCurrentIndex(nextIndex);
        }, 1000);
    }, [currentIndex, films]);


    const handleLeftClick = useCallback(() => {
        const prevIndex = (currentIndex - 1 + films.length) % films.length;
        setSlides(prev => [films[prevIndex], ...prev]);

        if (trackRef.current) {
            trackRef.current.style.transition = 'none';
            trackRef.current.style.transform = 'translateX(-100%)';

            // 🔧 Force reflow
            void trackRef.current.offsetHeight;

            trackRef.current.style.transition = 'transform 1s ease-in-out';
            trackRef.current.style.transform = 'translateX(0)';
        }
        setTimeout(() => {
            setSlides(prev => prev.slice(0, prev.length - 1));
            setCurrentIndex(prevIndex);
        }, 1000);
    }, [currentIndex, films]);


    const handleIndicatorClick = (index) => {
        setCurrentIndex(index);
        setSlides([films[index]]);
    };



    useEffect(() => {
        const touchArea = touchRef.current;
        if (!touchArea) return;

        const handleTouchStart = (e) => {
            touchStartX.current = e.touches[0].clientX;
        };

        const handleTouchEnd = (e) => {
            touchEndX.current = e.changedTouches[0].clientX;
            const distance = touchStartX.current - touchEndX.current;

            const threshold = 50;

            if (distance > threshold) {
                handleRightClick();
            } else if (distance < -threshold) {
                handleLeftClick();
            }
        };

        touchArea.addEventListener('touchstart', handleTouchStart);
        touchArea.addEventListener('touchend', handleTouchEnd);

        return () => {
            touchArea.removeEventListener('touchstart', handleTouchStart);
            touchArea.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleLeftClick, handleRightClick]);


    useEffect(() => {
        const interval = setInterval(() => {
            handleRightClick();
        }, 5000);

        return () => clearInterval(interval);
    }, [handleRightClick]);

    return (
        <div className="carousel-container">
            <h1>{title}</h1>
            <div className="carousel-window" ref={touchRef}>
                <div className="carousel-track" ref={trackRef}>
                    {slides.map((film, idx) => (
                    <div className="carousel-slide" key={idx}>
                        <div className="carousel-image-wrapper">
                            <Link to={`/filmek/${film.link}`}>
                                <img src={film.image} alt={film.title} />
                            </Link>
                            <button className="carousel-arrow left" onClick={handleLeftClick}>&lt;</button>
                            <button className="carousel-arrow right" onClick={handleRightClick}>&gt;</button>                            
                        </div>
                        <p>{film.body}</p>
                    </div>
                    ))}
                </div>
            </div>
            <div className="carousel-indicators">
                {films.map((_, index) => (
                    <span
                        key={index}
                        className={`status-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => handleIndicatorClick(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

LatestFilms.propTypes = {
    films: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired
};

export default LatestFilms;
