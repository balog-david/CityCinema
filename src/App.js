import React from 'react'
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReservationProvider } from './ReservationContext';
import Navbar from './Navbar';
import Home from './Home';
import Movies from './Movies';
import MovieDetails from './MovieDetails';
import Booking from './Booking';
import Upload from './Upload';
import UploadedMovieList from './UploadedMovieList';
import UploadMovie from './UploadMovie';
import Login from './Login';
import Cart from './Cart';
import BookingSummary from './BookingSummary';

function App() {
  return (
    <ReservationProvider>
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
        <Route path="/filmek/:link" element={<MovieDetails />} />
          <Route
            path="*"
            element={
              <div className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/filmek" element={<Movies />} />
                  <Route path="/filmek/:link/foglalas" element={<Booking />} />
                  <Route path="/feltoltes" element={<Upload />} />
                  <Route path="/feltoltottfilmek" element={<UploadedMovieList/>}/>
                  <Route path="/filmfeltoltes" element={<UploadMovie/>}/>
                  <Route path="/login" element={<Login/>}/>
                  <Route path="/kosar" element={<Cart/>}/>
                  <Route path="/foglalas" element={<BookingSummary/>}/>
                </Routes>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
    </ReservationProvider>
  );
}


export default App;
