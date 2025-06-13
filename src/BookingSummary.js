import useFetch from "./useFetch";
import React, { useState } from 'react'

const BookingSummary = () => {
    const storedToken = localStorage.getItem('userToken');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [bookingData, setBookingData] = useState(
        {
            name: "",
            email: "",
            telephone: ""
        }
    );
    const {data: tickets, isPending, error} = useFetch(`${process.env.REACT_APP_API_URL}/screenings/bytoken/${storedToken}`);
    console.log(tickets)
    const handleChange = (e) => {
        const {name, value} = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
        console.log(bookingData)
    };

    const sendMail = () => {
        const payload = {
            token: storedToken,
            name: bookingData.name,
            email: bookingData.email,
            telephone: bookingData.telephone,
            tickets: tickets
        };
        fetch(`${process.env.REACT_APP_API_URL}/sendmail`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
        .then(res => {
            if(!res.ok) {
                throw new Error('Hiba az e-mail küldése közben.');
            }
            return res.json();
        })
        .then(() => {
            setIsSubmitted(true);
            localStorage.removeItem('reservations');
        })
        .catch(error => {
            console.log('Hiba:', error);
            alert('Nem sikerült elküldeni a rendelést!');
        });
        localStorage.removeItem('userToken');
    };

    if (isSubmitted) {
        return <h1>Köszönjük a megrendelést!</h1>;
    }

    if (isPending) return <p>Betöltés folyamatban...</p>;
    if (error) return <p>Hiba történt: {error}</p>;

    if (!tickets || tickets.length === 0) return <p>Nincsenek jegyek.</p>;

    return ( 
        <div className="booking-container">
            {tickets.map(ticket => (
            <div key={ticket.id} className="ticket">
                <h3 className="ticket-title">{ticket.name}</h3>
                <div className="ticket-grid">
                <span>Dátum:</span>
                <span>{ticket.date.replaceAll("-", ".") + "."}</span>

                <span>Időpont:</span>
                <span>{ticket.time}</span>

                <span>Terem:</span>
                <span>{ticket.roomName}</span>

                <span>Székek:</span>
                <span>{ticket.seats.join(", ")}</span>
                </div>
            </div>
            ))}
            <div className="ordering-data">
                <label htmlFor="bookingName">Teljes név:</label>
                <input 
                    type="text"
                    id="bookingName"
                    name="name"
                    className="name-input"
                    placeholder="Pl. Gipsz Jakab" 
                    value={bookingData.name}
                    onChange={handleChange}
                />
                <label htmlFor="bookingMail">E-mail:</label>
                <input 
                    type="email" 
                    id="bookingMail"
                    name="email" 
                    className="mail-input"
                    placeholder="gipsz.jakab@email.com" 
                    value={bookingData.email}
                    onChange={handleChange}
                />
                <label htmlFor="bookingTelephone">Telefonszám:</label>
                <input 
                    type="tel" 
                    id="bookingTelephone"
                    name="telephone" 
                    className="telephone-input"
                    placeholder="+36 30 123 4567" 
                    value={bookingData.telephone}
                    onChange={handleChange}
                />
            </div>
            <button onClick={sendMail}>Megerősít</button>
        </div>
     );
}
 
export default BookingSummary;