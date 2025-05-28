import React, { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [ticketCount, setTicketCount] = useState(0);

  const userToken = localStorage.getItem('userToken');

  const updateTicketCount = useCallback(() => {
    const reservationsRaw = localStorage.getItem('reservations');
    const reservations = reservationsRaw ? JSON.parse(reservationsRaw) : {};
    let count = 0;

    Object.values(reservations).forEach(r => {
      if (r.userToken === userToken) {
        count += r.count;
      }
    });

    setTicketCount(count);
  }, [userToken]);

  useEffect(() => {
    updateTicketCount();
  }, [updateTicketCount]);

  return (
    <ReservationContext.Provider value={{ ticketCount, updateTicketCount }}>
      {children}
    </ReservationContext.Provider>
  );

};

ReservationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
