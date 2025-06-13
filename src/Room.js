import React, { useState, useEffect, useRef, useContext } from 'react';
import useFetch from './useFetch';
import { ReservationContext } from './ReservationContext';
import PropTypes from 'prop-types';

const generateToken = () =>
  'xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });

const Room = ({ screeningId }) => {
  const divRef = useRef(null);
  const [seats, setSeats] = useState([]);
  const [seatSize, setSeatSize] = useState(0);
  const socketRef = useRef(null);
  const { data, isPending, error } = useFetch(`${process.env.REACT_APP_API_URL}/screenings/${screeningId}`);
  const [userToken] = useState(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) return storedToken;
    const newToken = generateToken();
    localStorage.setItem('userToken', newToken);
    console.log('Új user token generálva:', newToken);
    return newToken;
  });

  const { updateTicketCount } = useContext(ReservationContext);

  useEffect(() => {
    if (!seats.length) return;

    const gap = 10;
    const maxSeatsInRow = Math.max(...seats.map(row => row.length));
    const moziWidth = divRef.current ? divRef.current.offsetWidth : 0;

    const totalGap = (maxSeatsInRow + 1) * gap;
    const availableWidth = moziWidth - totalGap;

    const calculatedSeatWidth = maxSeatsInRow > 0
      ? Math.floor(availableWidth / maxSeatsInRow)
      : 0;

    const maxSeatWidth = Math.min(calculatedSeatWidth, 40);

    setSeatSize(maxSeatWidth);
  }, [seats]);


  useEffect(() => {
  if (!screeningId) return;

  console.log('Új screeningId-hez csatlakozás:', screeningId);

  const socket = new WebSocket(process.env.REACT_APP_WS_URL);
  socketRef.current = socket;

  socket.onopen = () => {
    console.log('WebSocket kapcsolat nyitva.');
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log('WebSocket üzenet érkezett:', msg);

      if (msg.type === 'seat-update' && msg.seat) {
        console.log('Egységes frissítés:', msg.seat);
        const { id, status, reservedby, until } = msg.seat;
        setSeats(prevSeats =>
          prevSeats.map(row =>
            row.map(seat => {
              if (seat.id === id) {
                return { ...seat, status, reservedby, until };
              } else {
                return { ...seat }; // új példány, akkor is, ha nem változott
              }
            })
          )
        );
      } else if (msg.type === 'seats-bulk-update' && Array.isArray(msg.seats)) {
        console.log('Tömeges frissítés:', msg.seats);
        setSeats(prevSeats =>
          prevSeats.map(row =>
            row.map(seat => {
              const updatedSeat = msg.seats.find(s => s.id === seat.id);
              return updatedSeat ? { ...seat, ...updatedSeat } : seat;
            })
          )
        );
      }
    } catch (err) {
      console.error('Hibás WebSocket üzenet:', err);
    }
  };

  socket.onerror = (err) => {
    console.error('WebSocket hiba:', err);
  };

  socket.onclose = () => {
    console.log('WebSocket kapcsolat lezárva.');
  };

  return () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Korábbi kapcsolat bezárása.');
      socket.close();
    }
    socketRef.current = null;
  };
}, [screeningId]);

  useEffect(() => {
    if (data?.seats) {
      const copiedSeats = data.seats.map(row => row.map(seat => ({ ...seat })));
      setSeats(copiedSeats);
      console.log('Székek betöltve HTTP-ből:', copiedSeats);
    }
  }, [data]);

  const handleSeatClick = async (rowIndex, seatIndex) => {
    const seat = seats[rowIndex][seatIndex];
    console.log('Kattintott szék:', seat);

    if (seat.status === 'reserved' && seat.reservedby !== userToken) {
      console.log('Szék foglalt más által, nem lehet módosítani.');
      return;
    }

    const reservationsRaw = localStorage.getItem('reservations');
    const reservations = reservationsRaw ? JSON.parse(reservationsRaw) : {};

    const existingScreeningIds = Object.keys(reservations).filter(id =>
      reservations[id].userToken === userToken &&
      reservations[id].count > 0 &&
      id !== screeningId
    );

    if (existingScreeningIds.length > 0) {
      alert('Már van foglalásod egy másik vetítésre. Előbb azt kell törölnöd.');
      return;
    }

    const newStatus = seat.status === 'available' ? 'reserved' : 'available';
    const updatedSeat = {
      status: newStatus,
      reservedby: newStatus === 'reserved' ? userToken : null,
      until: newStatus === 'reserved' ? Date.now() + 10 * 60 * 1000 : null
    };

    fetch(`${process.env.REACT_APP_API_URL}/screenings/${screeningId}/seats/${seat.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-token': userToken
      },
      body: JSON.stringify(updatedSeat)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Szerver hiba a státusz frissítésnél');
      }

      const prevCount = reservations[screeningId]?.count || 0;
      const newCount = newStatus === 'reserved' ? prevCount + 1 : Math.max(prevCount - 1, 0);

      if (newCount === 0) {
        delete reservations[screeningId];
      } else {
        reservations[screeningId] = {
          userToken,
          screeningId,
          count: newCount
        };
      }

      localStorage.setItem('reservations', JSON.stringify(reservations));
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'seat-update',
          screeningId,
          seat: {
            id: seat.id,
            ...updatedSeat
          }
        }));
      }
})
.catch(err => {
  console.error('Hiba a szék frissítésekor:', err);
});

  updateTicketCount();
};
useEffect(() => {
  console.log('Frissült seats state:', seats);
}, [seats]);

  if (isPending) return <p>Betöltés...</p>;
  if (error) return <p>Hiba: {error}</p>;

  return (
    <div className="mozi" ref={divRef}>
      <h2>{data?.roomName}</h2>
      {seats.map((row, rowIndex) => (
        <div className="sor" key={rowIndex}>
          {row.map((seat, seatIndex) => (
            <div
              key={seat.id}
              className={`szek ${seat.status} ${seat.reservedby === userToken ? 'sajat' : ''}`}
              title={`Szék: ${seat.id}`}
              onClick={() => handleSeatClick(rowIndex, seatIndex)}
              style={{
                width: `${seatSize}px`,
                height: `${seatSize}px`,
              }}
            >
              {seat.id}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

Room.propTypes = {
  screeningId: PropTypes.string.isRequired,
}

export default Room;
