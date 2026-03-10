import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { callAPI } from '../utils/api';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [missedSlots, setMissedSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New slot form
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    chairs: 5
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsRes, bookingsRes, missedRes, usersRes, reviewsRes] = await Promise.all([
        callAPI({ action: 'getSlots' }),
        callAPI({ action: 'getBookings' }),
        callAPI({ action: 'missedSlots' }),
        callAPI({ action: 'getAllUsers', adminId: user.id }),
        callAPI({ action: 'getReviews' })
      ]);
      setSlots(slotsRes);
      setBookings(bookingsRes);
      setMissedSlots(missedRes);
      setUsers(usersRes);
      setReviews(reviewsRes);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper function to get phone number from username
  const getPhoneNumberFromUsername = useCallback((username) => {
    if (!username || !users.length) return 'N/A';
    
    // Create email from username (assuming username + @gmail.com)
    const derivedEmail = `${username}@gmail.com`;
    
    // Find user with matching email
    const user = users.find(u => u.email && u.email.toLowerCase() === derivedEmail.toLowerCase());
    
    return user?.phone || 'N/A';
  }, [users]);

  // Helper function to check if a booking date is in the past
  const isPastDate = useCallback((dateString) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const bookingDate = new Date(dateString);
      bookingDate.setHours(0, 0, 0, 0);
      
      return bookingDate < today;
    } catch (error) {
      return false;
    }
  }, []);

  // Helper function to create a sortable datetime string
  const getSortableDateTime = useCallback((date, time) => {
    // Ensure date is in YYYY-MM-DD format
    let formattedDate = date;
    if (date && date.includes('-')) {
      const [year, month, day] = date.split('-');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Ensure time is in HH:MM format
    let formattedTime = time;
    if (time && time.includes(':')) {
      const [hours, minutes] = time.split(':');
      formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    return `${formattedDate}T${formattedTime}`;
  }, []);

  // Filter bookings to show only current/future dates and sort them
  const currentBookings = useMemo(() => {
    return bookings
      .filter(booking => !isPastDate(booking.date))
      .sort((a, b) => {
        const dateTimeA = getSortableDateTime(a.date, a.start);
        const dateTimeB = getSortableDateTime(b.date, b.start);
        return dateTimeA.localeCompare(dateTimeB);
      });
  }, [bookings, isPastDate, getSortableDateTime]);

  // Filter pending bookings to show only current/future dates and sort them
  const pendingBookings = useMemo(() => {
    return bookings
      .filter(booking => booking.status === 'pending' && !isPastDate(booking.date))
      .sort((a, b) => {
        const dateTimeA = getSortableDateTime(a.date, a.start);
        const dateTimeB = getSortableDateTime(b.date, b.start);
        return dateTimeA.localeCompare(dateTimeB);
      });
  }, [bookings, isPastDate, getSortableDateTime]);

  // Calculate missed slots from past bookings that weren't attended
  const calculateMissedSlots = useCallback(() => {
    const pastBookings = bookings.filter(booking => 
      isPastDate(booking.date) && booking.status === 'approved'
    );
    
    // Sort missed slots by date (most recent first)
    const sortedPastBookings = [...pastBookings].sort((a, b) => {
      const dateTimeA = getSortableDateTime(a.date, a.start);
      const dateTimeB = getSortableDateTime(b.date, b.start);
      // For missed slots, show most recent first (descending)
      return dateTimeB.localeCompare(dateTimeA);
    });
    
    return sortedPastBookings.map(booking => ({
      bookingId: booking.id,
      userName: booking.userName,
      date: booking.date,
      time: booking.start,
      chairNo: booking.chairNo,
      status: 'missed',
      phoneNumber: getPhoneNumberFromUsername(booking.userName)
    }));
  }, [bookings, isPastDate, getSortableDateTime, getPhoneNumberFromUsername]);

  useEffect(() => {
    // Update missed slots whenever bookings change
    const calculatedMissed = calculateMissedSlots();
    setMissedSlots(calculatedMissed);
  }, [bookings, calculateMissedSlots]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Additional client-side validation
    const selectedDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      setError('Cannot create slot in the past. Please select a future date and time.');
      setLoading(false);
      return;
    }

    try {
      const response = await callAPI({
        action: 'createSlot',
        adminId: user.id,
        ...newSlot
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Slot created successfully!');
        setNewSlot({ date: '', startTime: '', endTime: '', chairs: 5 });
        await fetchData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to create slot');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId, status) => {
    setLoading(true);
    setError('');

    try {
      const response = await callAPI({
        action: 'approveBooking',
        adminId: user.id,
        id: bookingId,
        status: status
      });

      if (response.error) {
        setError(response.error);
      } else {
        await fetchData();
        setSuccess(`Booking ${status} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await callAPI({
        action: 'deleteReview',
        adminId: user.id,
        reviewId: reviewId
      });

      if (response.error) {
        setError(response.error);
      } else {
        await fetchData();
        setSuccess('Review deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // If it's in YYYY-MM-DD format
      if (dateString.includes('-') && dateString.length === 10) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If it's an ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      return dateString;
    } catch (error) {
      return dateString;
    }
  }, []);

  // Format time for display
  const formatTime = useCallback((timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // If it's in HH:MM format
      if (timeString.includes(':') && timeString.length <= 5) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      // If it's an ISO string
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      return timeString;
    } catch (error) {
      return timeString;
    }
  }, []);

  // Format date and time together
  const formatDateTime = useCallback((date, time) => {
    if (!date || !time) return 'N/A';
    
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(time);
    
    return `${formattedDate} • ${formattedTime}`;
  }, [formatDate, formatTime]);

  // Format time range
  const formatTimeRange = useCallback((start, end) => {
    const formattedStart = formatTime(start);
    const formattedEnd = formatTime(end);
    return `${formattedStart} - ${formattedEnd}`;
  }, [formatTime]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Slots
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals {pendingBookings.length > 0 && `(${pendingBookings.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'missed' ? 'active' : ''}`}
            onClick={() => setActiveTab('missed')}
          >
            Missed Slots {missedSlots.length > 0 && `(${missedSlots.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Bookings {currentBookings.length > 0 && `(${currentBookings.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="dashboard-content">
        {activeTab === 'create' && (
          <div className="create-slot">
            <h2>Create New Time Slot</h2>
            <form onSubmit={handleCreateSlot}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Number of Chairs</label>
                <input
                  type="number"
                  value={newSlot.chairs}
                  onChange={(e) => setNewSlot({...newSlot, chairs: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Slot'}
              </button>
            </form>

            <div className="existing-slots">
              <h3>Existing Future Slots</h3>
              <div className="slots-list">
                {slots.length === 0 ? (
                  <p>No future slots available</p>
                ) : (
                  slots.map(slot => (
                    <div key={slot.slotId} className="slot-item">
                      <span>
                        {formatDate(slot.date)} • {formatTimeRange(slot.start, slot.end)}
                      </span>
                      <span className={`badge ${slot.available > 0 ? 'badge-available' : 'badge-full'}`}>
                        {slot.booked}/{slot.chairs} booked
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-approvals">
            <h2>Pending Approvals (Current & Future Dates)</h2>
            {pendingBookings.length === 0 ? (
              <p>No pending approvals for current or future dates</p>
            ) : (
              pendingBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <p><strong>User:</strong> {booking.userName}</p>
                    <p><strong>Phone:</strong> {getPhoneNumberFromUsername(booking.userName)}</p>
                    <p><strong>Date:</strong> {formatDateTime(booking.date, booking.start)}</p>
                    <p><strong>Chair:</strong> {booking.chairNo}</p>
                    {booking.reason && (
                      <p><strong>Reason:</strong> {booking.reason}</p>
                    )}
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApproveBooking(booking.id, 'approved')}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleApproveBooking(booking.id, 'cancelled')}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'missed' && (
          <div className="missed-slots">
            <h2>Missed Slots (Past Dates - Most Recent First)</h2>
            {missedSlots.length === 0 ? (
              <p>No missed slots found</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Phone Number</th>
                    <th>Booking ID</th>
                    <th>Date & Time</th>
                    <th>Chair No</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {missedSlots.map(missed => (
                    <tr key={missed.bookingId}>
                      <td>{missed.userName}</td>
                      <td>{missed.phoneNumber}</td>
                      <td>{missed.bookingId.substring(0, 8)}...</td>
                      <td>{formatDateTime(missed.date, missed.time)}</td>
                      <td>{missed.chairNo}</td>
                      <td>
                        <span className="badge badge-cancelled">Missed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="all-bookings">
            <h2>All Bookings (Current & Future Dates - Sorted Chronologically)</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Phone Number</th>
                  <th>Date & Time</th>
                  <th>Chair</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.userName}</td>
                    <td>{getPhoneNumberFromUsername(booking.userName)}</td>
                    <td>{formatDateTime(booking.date, booking.start)}</td>
                    <td>{booking.chairNo}</td>
                    <td>
                      <span className={`badge badge-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{booking.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Summary Section */}
            <div className="bookings-summary">
              <h3>Summary</h3>
              <div className="summary-stats">
                <div className="stat-card">
                  <span className="stat-label">Total Current Bookings:</span>
                  <span className="stat-value">{currentBookings.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Pending Approvals:</span>
                  <span className="stat-value">{pendingBookings.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Missed Slots (Past):</span>
                  <span className="stat-value">{missedSlots.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-management">
            <h2>Registered Users</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`badge ${user.isAdmin ? 'badge-approved' : 'badge-pending'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-management">
            <h2>All Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.userName}</span>
                        <span className="review-date">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <div className="review-comment">
                      <p>"{review.comment}"</p>
                    </div>
                    <div className="review-actions">
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={loading}
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;