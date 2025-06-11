import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const AllFilms = ({ films = [], screenings = [], title }) => {
  const validScreenings = Array.isArray(screenings) ? screenings : [];

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  const getWeekDates = (offset) => {
    const dates = [];
    const base = new Date();
    base.setDate(base.getDate() + offset * 7);
    for (let i = 0; i < 7; i++) {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const currentWeek = getWeekDates(weekOffset);

  return (
    <div className="film-list">
      <h1>{title}</h1>

      <div className="date-bar">
        <button
          className="nav-button"
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={weekOffset === 0}
        >
          ‹
        </button>
        <div className="date-list">
          {currentWeek.map((date, idx) => {
            const dateStr = date.toDateString();
            const label = date.toLocaleDateString("hu-HU", {
              weekday: "short",
              month: "2-digit",
              day: "2-digit",
            });

            return (
              <button
                key={idx}
                className={`date-button ${selectedDate === dateStr ? "selected" : ""}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          className="nav-button"
          onClick={() => setWeekOffset(weekOffset + 1)}
        >
          ›
        </button>
      </div>

      {films.map(film => {
        const filmScreenings = validScreenings
          .filter(s => s.name === film.title && new Date(s.date).toDateString() === selectedDate)
          .sort((a, b) => {
            const [aH, aM] = a.time.split(":").map(Number);
            const [bH, bM] = b.time.split(":").map(Number);
            return aH * 60 + aM - (bH * 60 + bM);
          });

        if (filmScreenings.length === 0) return null;

        return (
          <div className="film-preview" key={film._id}>
            <h2>{film.title}</h2>
            <div className="dates-img">
              <Link to={`/filmek/${film.link}`}>
                <img src={film.image} alt={film.title} className="film-image"/>
              </Link>
              <div className="alltimes">
                {filmScreenings.map((screening, index) => (
                  <Link
                    to={`/filmek/${film.link}/foglalas`}
                    state={{ time: screening.time, film, date: screening.date, screeningId: screening._id }}
                    key={index}
                    className="time-slot"
                  >
                    {screening.time}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

AllFilms.propTypes = {
  films: PropTypes.array.isRequired,
  screenings: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export default AllFilms;
