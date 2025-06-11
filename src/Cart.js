import useFetch from "./useFetch";
import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ReservationContext } from './ReservationContext';

const Cart = () => {
  const storedToken = localStorage.getItem('userToken');
  const rawReservations = localStorage.getItem('reservations');
  const [reservations, setReservations] = useState(JSON.parse(rawReservations || "{}"));

  const { data: tickets, isPending, error } = useFetch(`${process.env.REACT_APP_API_URL}/screenings/bytoken/${storedToken}`);
  const [localTickets, setLocalTickets] = useState([]);

  const { updateTicketCount } = useContext(ReservationContext);
  
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.REACT_APP_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => console.log('WebSocket kapcsolat létrejött');
    socket.onclose = () => console.log('WebSocket kapcsolat bezárva');
    socket.onerror = (err) => console.error('WebSocket hiba:', err);

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (tickets) {
      setLocalTickets(tickets);
    }
  }, [tickets]);

  const handleDelete = (ticketId, seatId) => {
    const updatedSeat = {
      status: "available",
      reservedby: "",
      until: ""
    };

    fetch(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}/seats/${seatId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-token': storedToken
      },
      body: JSON.stringify(updatedSeat)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Szerver hiba a státusz frissítésnél');
      }

    setLocalTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, seats: ticket.seats.filter(id => id !== seatId) }
          : ticket
      ).filter(ticket => ticket.seats.length > 0)
    );

    const prevCount = reservations[ticketId]?.count || 0;
    const newCount = Math.max(prevCount - 1, 0);
    const newReservations = { ...reservations };

    if (newCount === 0) {
      delete newReservations[ticketId];
    } else {
      newReservations[ticketId] = {
        userToken: storedToken,
        screeningId: ticketId,
        count: newCount
      };
    }

    localStorage.setItem('reservations', JSON.stringify(newReservations));
    setReservations(newReservations);

    updateTicketCount();
    const screeningId = tickets[0].id
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'seat-update',
        screeningId,
        seat: {
          id: seatId,
          ...updatedSeat
        }
      }));
    }
  })
  .catch(err => {
    console.error('Hiba a szék frissítésekor:', err);
  });
};


  if (isPending) return <p>Betöltés folyamatban...</p>;
  if (error) return <p>Hiba történt: {error}</p>;
  if (!localTickets || localTickets.length === 0) return <p>Nincsenek jegyek.</p>;

  return (
    <div className="ticket-container">
      {localTickets.map(ticket =>
        ticket.seats.map(seatId => (
          <div key={`${ticket.id}-${seatId}`} className="ticket">
            <h3>{ticket.name}</h3>
            <p>Dátum: {ticket.date}</p>
            <p>Idő: {ticket.time}</p>
            <p>Terem: {ticket.roomName}</p>
            <p>Szék: {seatId}</p>
            <button onClick={() => handleDelete(ticket.id, seatId)}>Törlés</button>
          </div>
        ))
      )}
      <Link to="/foglalas"><button>Foglalás!</button></Link>
    </div>
  );
};

export default Cart;
