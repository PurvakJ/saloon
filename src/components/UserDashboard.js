import React, { useState, useEffect, useCallback } from 'react';
import { callAPI } from '../utils/api';
import SlotBooking from './SlotBooking';
import MyBookings from './MyBookings';

const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('book');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSlots = useCallback(async () => {
    try {
      const response = await callAPI({ action: 'getSlots' });
      setSlots(response);
    } catch (err) {
      setError('Failed to fetch slots');
    }
  }, []);

  const fetchUserBookings = useCallback(async () => {
    try {
      const response = await callAPI({ 
        action: 'getBookings',
        userId: user.id 
      });
      setBookings(response);
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  }, [user.id]);

  useEffect(() => {
    fetchSlots();
    fetchUserBookings();
  }, [fetchSlots, fetchUserBookings]);

  const handleBookSlot = async (slotId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await callAPI({
        action: 'bookSlot',
        userId: user.id,
        userName: user.name,
        slotId: slotId
      });

      if (response.error) {
        setError(response.error);
      } else {
        await fetchUserBookings();
        await fetchSlots();
        setActiveTab('mybookings');
      }
    } catch (err) {
      setError('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    setLoading(true);
    setError('');

    try {
      const response = await callAPI({
        action: 'cancelBooking',
        id: bookingId,
        reason: reason
      });

      if (response.error) {
        setError(response.error);
      } else {
        await fetchUserBookings();
        await fetchSlots();
      }
    } catch (err) {
      setError('Cancellation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingId, reason) => {
    setLoading(true);
    setError('');

    try {
      const response = await callAPI({
        action: 'updateBooking',
        id: bookingId,
        reason: reason
      });

      if (response.error) {
        setError(response.error);
      } else {
        await fetchUserBookings();
      }
    } catch (err) {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date, time) => {
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            Book Appointment
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mybookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mybookings')}
          >
            My Bookings
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        {activeTab === 'book' && (
          <SlotBooking 
            slots={slots}
            onBookSlot={handleBookSlot}
            loading={loading}
            formatDateTime={formatDateTime}
            user={user}
          />
        )}
        {activeTab === 'mybookings' && (
          <MyBookings 
            bookings={bookings}
            onCancel={handleCancelBooking}
            onUpdate={handleUpdateBooking}
            loading={loading}
            formatDateTime={formatDateTime}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;