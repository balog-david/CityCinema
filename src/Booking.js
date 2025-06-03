import { useLocation, useParams } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import useFetch from './useFetch';
import Room from './Room';

const Booking = () => {
  const location = useLocation();
  const { link } = useParams();
  const [film, setFilm] = useState(location.state?.film || null);
  const [movieTime, setMovieTime] = useState(location.state?.time || null);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dateChangedByUser, setDateChangedByUser] = useState(false);
  const initialDate = location.state?.date
  ? new Date(location.state.date).toDateString()
  : new Date().toDateString();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  
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
  const { data: screeningsDataRaw, isPending, error } = useFetch(`${process.env.REACT_APP_API_URL}/screenings`);
  const screeningsData = useMemo(() => screeningsDataRaw || [], [screeningsDataRaw]);

  useEffect(() => {
    if (!film && screeningsData.length > 0) {
      const screening = screeningsData.find(s => s.link === link);
      if (screening) {
        setFilm({ title: screening.name });
        if (!movieTime) {
          setMovieTime(screening.time);
          setSelectedScreening(screening);
        }
      }
    }
  }, [film, link, screeningsData, movieTime]);

  useEffect(() => {
  if (location.state?.screeningId && screeningsData.length > 0) {
    const matched = screeningsData.find(s => s._id === location.state.screeningId);
    if (matched?.date) {
      const matchedDate = new Date(matched.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffInDays = Math.floor((matchedDate - today) / (1000 * 60 * 60 * 24));
      const offset = Math.floor(diffInDays / 7);

      setSelectedDate(matchedDate.toDateString());
      setWeekOffset(offset);
    }
  }
}, [location.state?.screeningId, screeningsData]);

  const screeningsForFilm = useMemo(() => {
  return screeningsData
    .filter(s => {
      const matchesFilm = s.name === film?.title;

      const screeningDateStr = new Date(s.date).toDateString();
      const matchesDate = screeningDateStr === selectedDate;

      return matchesFilm && matchesDate;
    })
    .sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
}, [screeningsData, film, selectedDate]);

  useEffect(() => {
    if (selectedScreening && !selectedScreening.room) {
      const selectedRoom = screeningsData.find(s => s._id === selectedScreening._id)?.room;
      if (selectedRoom) {
        setSelectedScreening(prev => ({ ...prev, room: selectedRoom }));
      }
    }
  }, [selectedScreening, screeningsData]);

  useEffect(() => {
  if (dateChangedByUser) {
    setMovieTime(null);
    setSelectedScreening(null);
    setDateChangedByUser(false);
  }
}, [selectedDate, dateChangedByUser]);

  useEffect(() => {
  const matchingScreening = screeningsForFilm.find(s => s.time === movieTime);
  if (matchingScreening) {
    setSelectedScreening(matchingScreening);
  } else {
    setSelectedScreening(null);
  }
}, [selectedDate, screeningsForFilm, movieTime]);

  return (
    <div className="booking">
      <h2>Foglalás: {film?.title || 'Film betöltése...'}</h2>
      <p>Időpont: {movieTime || "Válassz időpontot!"}</p>

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
                onClick={() =>{
                    setSelectedDate(dateStr);
                    setDateChangedByUser(true);
                }}
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

      <div className="times">
        {screeningsForFilm.length > 0 ? (
          screeningsForFilm.map(screening => (
            <div
              className={`time-slot ${movieTime === screening.time ? 'selected' : ''}`}
              key={screening._id}
              onClick={() => {
                setMovieTime(screening.time);
                setSelectedScreening(screening);
              }}
            >
              {screening.time}
            </div>
          ))
        ) : (
          <div>Nincs elérhető időpont!</div>
        )}
      </div>

      <div className="seats">
        {error && <div>{error}</div>}
        {isPending && <div>Betöltés...</div>}
        {selectedScreening && (
          <Room screeningId={selectedScreening._id} />
        )}
      </div>
    </div>
  );
};

export default Booking;
