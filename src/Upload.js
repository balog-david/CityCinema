import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [screenings, setScreenings] = useState([
    { 
      movie: "", 
      room: "", 
      date: new Date().toISOString().split("T")[0], 
      hour: 12, 
      minute: "00" }
  ]);
  const [screeningList, setScreeningList] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = (id) => {
    fetch(`${process.env.REACT_APP_API_URL}/screenings/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if(!res.ok) throw new Error('Hiba történt a törlés közben!');
    })
    .then(id => {
      setMovies((prev) => prev.filter((m) => m._id !== id));
      setRefreshKey(prev => prev - 1);
    })
    .catch(err => {
      console.error('Törlés sikertelen:', err);
    })
  };

  const handleSubmit = () => {
    const errors = screenings.some(screening =>
      screening.movie === "" || screening.room === ""
    );
    if (errors) {
      alert("Minden vetítésnél kötelező film és terem kiválasztása!");
      return;
    }

    const screeningObjects = screenings.map(screening => {
      const movie = movies.find(m => m._id === screening.movie);
      const roomObj = rooms.find(r => r._id === screening.room);

      return {
        name: movie?.title || "Ismeretlen",
        date: screening.date,
        time: `${String(screening.hour).padStart(2, "0")}:${screening.minute}`,
        roomName: roomObj?.name || "Ismeretlen terem",
        seats: roomObj?.seats || []
      };
    });

    fetch(`${process.env.REACT_APP_API_URL}/screenings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(screeningObjects)
    })
      .then(res => res.json())
      .then(() => {
        setRefreshKey(prev => prev + 1);
      })
      .catch(err => {
        console.error("Hiba a vetítések feltöltésekor:", err);
        alert("Hiba történt a feltöltés során.");
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

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
    fetch(`${process.env.REACT_APP_API_URL}/movies`)
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error("Hiba a filmek lekérésekor:", err));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/rooms`)
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error("Hiba a termek lekérésekor:", err));
  }, []);

  useEffect(() => {
  fetch(`${process.env.REACT_APP_API_URL}/screenings`)
    .then(res => res.json())
    .then(data => {
      const sorted = [...data].sort((a, b) => {
        const aDateTime = new Date(`${a.date}T${a.time}`);
        const bDateTime = new Date(`${b.date}T${b.time}`);
        return aDateTime - bDateTime;
      });
      setScreeningList(sorted);
    })
    .catch(err => console.error("Hiba az adások lekérésekor:", err));  
}, [refreshKey]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = ["00", "15", "30", "45"];

  const handleChange = (index, field, value) => {
    const newScreenings = [...screenings];
    newScreenings[index][field] = value;
    setScreenings(newScreenings);
  };

  const addRow = () => {
    setScreenings([
      ...screenings,
      { 
        movie: "", 
        room: "", 
        date: new Date().toISOString().split("T")[0], 
        hour: 12, 
        minute: "00" }
    ]);
  };

  if (!authChecked) return null;
  return (
    <div className="screening-upload-container">
      <div className="list-screenings">
        {screeningList.map((screening) => (
          <div className="screening" key={screening._id}>
            <h3>{screening.name }</h3>
            <p>{screening.date}</p>
            <p>{screening.time}</p>
            <button onClick={() => handleDelete(screening._id)} className="delete">Törlés</button>
          </div>
        ))}
      </div>

      <div className="screening-upload-form">
        <h2>Új vetítések hozzáadása</h2>
          {screenings.map((screening, index) => (
          <div 
            key={index} 
            className="screening-row"
          >
            <label>Film:</label>
            <select value={screening.movie} onChange={e => handleChange(index, "movie", e.target.value)}>
              <option value="">Válassz filmet</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>{movie.title}</option>
              ))}
            </select>

            <label>Terem:</label>
            <select value={screening.room} onChange={e => handleChange(index, "room", e.target.value)}>
              <option value="">Válassz termet</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>{room.name}</option>
              ))}
            </select>

            <label>Dátum:</label>
            <input type="date" value={screening.date} onChange={e => handleChange(index, "date", e.target.value)} />

            <label>Időpont:</label>
            <div className="time-select">
              <select value={screening.hour} onChange={e => handleChange(index, "hour", e.target.value)}>
                {hours.map(hour => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select value={screening.minute} onChange={e => handleChange(index, "minute", e.target.value)}>
                {minutes.map(min => (
                  <option key={min} value={min}>
                    {min.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        </div>
        
        <div className="upload-buttons">
          <button onClick={addRow}>+ Új vetítés hozzáadása</button>
          <button onClick={handleSubmit}>Feltöltés</button>
        </div>
      </div>    
  );
};

export default Upload;
