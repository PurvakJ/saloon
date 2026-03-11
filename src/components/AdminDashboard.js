import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { callAPI } from '../utils/api';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states for different tabs
  const [slotsFilter, setSlotsFilter] = useState('all'); // 'all', 'available', 'today'
  const [pendingFilter, setPendingFilter] = useState('all'); // 'all', 'today', 'tomorrow', 'thisWeek'
  const [missedFilter, setMissedFilter] = useState('all'); // 'all', 'lastWeek', 'lastMonth', 'older'
  const [bookingsFilter, setBookingsFilter] = useState('all'); // 'all', 'today', 'thisWeek', 'thisMonth'

  // New slot form
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    chairs: 5
  });

  // Helper function to check if a date is valid (not in the past)
  const isSlotValid = useCallback((slot) => {
    if (!slot || !slot.date || !slot.start) return false;

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Parse slot date
      let slotDate;
      if (slot.date.includes('T')) {
        slotDate = new Date(slot.date);
      } else {
        const [year, month, day] = slot.date.split('-');
        slotDate = new Date(year, month - 1, day);
      }
      
      // Reset time part for date comparison
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      
      // If slot date is in the future, always valid
      if (slotDateOnly > today) {
        return true;
      }
      
      // If slot date is today, check if current time is before start time
      if (slotDateOnly.getTime() === today.getTime()) {
        // Parse start time
        let startHour, startMinute;
        
        if (slot.start.includes('T')) {
          const startDateTime = new Date(slot.start);
          startHour = startDateTime.getHours();
          startMinute = startDateTime.getMinutes();
        } else if (slot.start.includes(':')) {
          [startHour, startMinute] = slot.start.split(':').map(Number);
        } else {
          return false;
        }
        
        // Create start time for today
        const startTimeToday = new Date();
        startTimeToday.setHours(startHour, startMinute, 0, 0);
        
        // Return true if current time is before start time
        return now < startTimeToday;
      }
      
      // If slot date is in the past, invalid
      return false;
      
    } catch (error) {
      console.error('Error checking slot validity:', error);
      return false;
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsRes, bookingsRes, usersRes, reviewsRes] = await Promise.all([
        callAPI({ action: 'getSlots' }),
        callAPI({ action: 'getBookings' }),
        callAPI({ action: 'getAllUsers', adminId: user.id }),
        callAPI({ action: 'getReviews' })
      ]);
      setSlots(slotsRes);
      setBookings(bookingsRes);
      setUsers(usersRes);
      setReviews(reviewsRes);
      
      // Debug: Log users data structure
      console.log('Users loaded:', usersRes);
      if (usersRes.length > 0) {
        console.log('Sample user structure:', usersRes[0]);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create a mapping of usernames to phone numbers for efficient lookup
  const userPhoneMap = useMemo(() => {
    const map = new Map();
    users.forEach(user => {
      // Map by full name
      if (user.name) {
        map.set(user.name.toLowerCase().trim(), user.phone);
      }
      // Map by email username part
      if (user.email) {
        const emailUsername = user.email.split('@')[0].toLowerCase().trim();
        map.set(emailUsername, user.phone);
        // Also map the full email
        map.set(user.email.toLowerCase().trim(), user.phone);
      }
      // Map by username if available
      if (user.username) {
        map.set(user.username.toLowerCase().trim(), user.phone);
      }
    });
    return map;
  }, [users]);

  // Helper function to get phone number from username
  const getPhoneNumberFromUsername = useCallback((username) => {
    if (!username || !users.length) return 'N/A';
    
    const normalizedUsername = username.toLowerCase().trim();
    
    // Try direct lookup from map
    const phone = userPhoneMap.get(normalizedUsername);
    if (phone) return phone;
    
    // Try partial matching if direct lookup fails
    for (const [key, value] of userPhoneMap.entries()) {
      if (key.includes(normalizedUsername) || normalizedUsername.includes(key)) {
        return value;
      }
    }
    
    return 'N/A';
  }, [userPhoneMap, users.length]);

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

  // Helper function to check date ranges
  const isDateInRange = useCallback((dateString, range) => {
    try {
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      switch(range) {
        case 'today':
          return date.getTime() === today.getTime();
        case 'tomorrow':
          return date.getTime() === tomorrow.getTime();
        case 'thisWeek':
          return date >= today && date <= nextWeek;
        case 'thisMonth':
          return date >= today && date <= nextMonth;
        case 'lastWeek':
          return date >= lastWeek && date < today;
        case 'lastMonth':
          return date >= lastMonth && date < today;
        case 'older':
          return date < lastMonth;
        default:
          return true;
      }
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

  // Filter and sort slots for create tab
  const filteredSlots = useMemo(() => {
    if (!slots || !Array.isArray(slots)) return [];
    
    // First filter out invalid (past) slots
    const validSlots = slots.filter(slot => isSlotValid(slot));
    
    // Apply additional filters
    let filtered = validSlots;
    
    if (slotsFilter === 'available') {
      filtered = validSlots.filter(slot => slot.available > 0);
    } else if (slotsFilter === 'today') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = validSlots.filter(slot => {
        try {
          let slotDate;
          if (slot.date.includes('T')) {
            slotDate = new Date(slot.date);
          } else {
            const [year, month, day] = slot.date.split('-');
            slotDate = new Date(year, month - 1, day);
          }
          
          const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
          return slotDateOnly.getTime() === today.getTime();
        } catch (error) {
          return false;
        }
      });
    }
    
    // Sort by date (oldest first)
    return [...filtered].sort((a, b) => {
      const dateA = a.date ? (a.date.includes('T') ? a.date.split('T')[0] : a.date) : '';
      const dateB = b.date ? (b.date.includes('T') ? b.date.split('T')[0] : b.date) : '';
      return new Date(dateA) - new Date(dateB);
    });
  }, [slots, slotsFilter, isSlotValid]);

  // Filter bookings to show only current/future dates
  const currentBookings = useMemo(() => {
    return bookings
      .filter(booking => !isPastDate(booking.date));
  }, [bookings, isPastDate]);

  // Apply additional filter to current bookings
  const filteredCurrentBookings = useMemo(() => {
    let filtered = currentBookings;
    
    if (bookingsFilter !== 'all') {
      filtered = currentBookings.filter(booking => 
        isDateInRange(booking.date, bookingsFilter)
      );
    }
    
    // Sort chronologically
    return filtered.sort((a, b) => {
      const dateTimeA = getSortableDateTime(a.date, a.start);
      const dateTimeB = getSortableDateTime(b.date, b.start);
      return dateTimeA.localeCompare(dateTimeB);
    });
  }, [currentBookings, bookingsFilter, isDateInRange, getSortableDateTime]);

  // Filter pending bookings
  const pendingBookings = useMemo(() => {
    return bookings
      .filter(booking => booking.status === 'pending' && !isPastDate(booking.date));
  }, [bookings, isPastDate]);

  // Apply additional filter to pending bookings
  const filteredPendingBookings = useMemo(() => {
    let filtered = pendingBookings;
    
    if (pendingFilter !== 'all') {
      filtered = pendingBookings.filter(booking => 
        isDateInRange(booking.date, pendingFilter)
      );
    }
    
    // Sort chronologically
    return filtered.sort((a, b) => {
      const dateTimeA = getSortableDateTime(a.date, a.start);
      const dateTimeB = getSortableDateTime(b.date, b.start);
      return dateTimeA.localeCompare(dateTimeB);
    });
  }, [pendingBookings, pendingFilter, isDateInRange, getSortableDateTime]);

  // Calculate missed slots from past bookings that weren't attended
  const calculateMissedSlots = useCallback(() => {
    const pastBookings = bookings.filter(booking => 
      isPastDate(booking.date) && booking.status === 'approved'
    );
    
    return pastBookings.map(booking => ({
      bookingId: booking.id,
      userName: booking.userName,
      date: booking.date,
      time: booking.start,
      chairNo: booking.chairNo,
      status: 'missed',
      phoneNumber: getPhoneNumberFromUsername(booking.userName)
    }));
  }, [bookings, isPastDate, getPhoneNumberFromUsername]);

  // Apply filter to missed slots
  const filteredMissedSlots = useMemo(() => {
    const calculatedMissed = calculateMissedSlots();
    
    let filtered = calculatedMissed;
    
    if (missedFilter !== 'all') {
      filtered = calculatedMissed.filter(missed => 
        isDateInRange(missed.date, missedFilter)
      );
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateTimeA = getSortableDateTime(a.date, a.time);
      const dateTimeB = getSortableDateTime(b.date, b.time);
      return dateTimeB.localeCompare(dateTimeA);
    });
  }, [calculateMissedSlots, missedFilter, isDateInRange, getSortableDateTime]);

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
            Pending Approvals {filteredPendingBookings.length > 0 && `(${filteredPendingBookings.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'missed' ? 'active' : ''}`}
            onClick={() => setActiveTab('missed')}
          >
            Missed Slots {filteredMissedSlots.length > 0 && `(${filteredMissedSlots.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Bookings {filteredCurrentBookings.length > 0 && `(${filteredCurrentBookings.length})`}
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
              
              {/* Filter Controls for Slots */}
              {filteredSlots.length > 0 && (
                <div className="filter-controls">
                  <button 
                    className={`filter-btn ${slotsFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSlotsFilter('all')}
                  >
                    All Future Slots
                  </button>
                  <button 
                    className={`filter-btn ${slotsFilter === 'available' ? 'active' : ''}`}
                    onClick={() => setSlotsFilter('available')}
                  >
                    Available Only
                  </button>
                  <button 
                    className={`filter-btn ${slotsFilter === 'today' ? 'active' : ''}`}
                    onClick={() => setSlotsFilter('today')}
                  >
                    Today's Slots
                  </button>
                </div>
              )}
              
              <div className="slots-list">
                {filteredSlots.length === 0 ? (
                  <p>No future slots available</p>
                ) : (
                  filteredSlots.map(slot => (
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
            
            {/* Filter Controls for Pending Bookings */}
            {filteredPendingBookings.length > 0 && (
              <div className="filter-controls">
                <button 
                  className={`filter-btn ${pendingFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('all')}
                >
                  All Future
                </button>
                <button 
                  className={`filter-btn ${pendingFilter === 'today' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('today')}
                >
                  Today
                </button>
                <button 
                  className={`filter-btn ${pendingFilter === 'tomorrow' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('tomorrow')}
                >
                  Tomorrow
                </button>
                <button 
                  className={`filter-btn ${pendingFilter === 'thisWeek' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('thisWeek')}
                >
                  This Week
                </button>
              </div>
            )}
            
            {filteredPendingBookings.length === 0 ? (
              <p>No pending approvals for current or future dates</p>
            ) : (
              filteredPendingBookings.map(booking => (
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
            
            {/* Filter Controls for Missed Slots */}
            {filteredMissedSlots.length > 0 && (
              <div className="filter-controls">
                <button 
                  className={`filter-btn ${missedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMissedFilter('all')}
                >
                  All Missed
                </button>
                <button 
                  className={`filter-btn ${missedFilter === 'lastWeek' ? 'active' : ''}`}
                  onClick={() => setMissedFilter('lastWeek')}
                >
                  Last Week
                </button>
                <button 
                  className={`filter-btn ${missedFilter === 'lastMonth' ? 'active' : ''}`}
                  onClick={() => setMissedFilter('lastMonth')}
                >
                  Last Month
                </button>
                <button 
                  className={`filter-btn ${missedFilter === 'older' ? 'active' : ''}`}
                  onClick={() => setMissedFilter('older')}
                >
                  Older
                </button>
              </div>
            )}
            
            {filteredMissedSlots.length === 0 ? (
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
                  {filteredMissedSlots.map(missed => (
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
            
            {/* Filter Controls for All Bookings */}
            {filteredCurrentBookings.length > 0 && (
              <div className="filter-controls">
                <button 
                  className={`filter-btn ${bookingsFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBookingsFilter('all')}
                >
                  All Future
                </button>
                <button 
                  className={`filter-btn ${bookingsFilter === 'today' ? 'active' : ''}`}
                  onClick={() => setBookingsFilter('today')}
                >
                  Today
                </button>
                <button 
                  className={`filter-btn ${bookingsFilter === 'thisWeek' ? 'active' : ''}`}
                  onClick={() => setBookingsFilter('thisWeek')}
                >
                  This Week
                </button>
                <button 
                  className={`filter-btn ${bookingsFilter === 'thisMonth' ? 'active' : ''}`}
                  onClick={() => setBookingsFilter('thisMonth')}
                >
                  This Month
                </button>
              </div>
            )}
            
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
                {filteredCurrentBookings.map(booking => (
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
                  <span className="stat-value">{filteredCurrentBookings.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Pending Approvals:</span>
                  <span className="stat-value">{filteredPendingBookings.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Missed Slots (Past):</span>
                  <span className="stat-value">{filteredMissedSlots.length}</span>
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

      <style jsx>{`
        .filter-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .filter-btn:hover {
          background: #f0f0f0;
        }
        
        .filter-btn.active {
          background: #007bff;
          color: white;
          border-color: #0056b3;
        }
        
        .slots-list {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        
        .slot-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .badge-available {
          background: #d4edda;
          color: #155724;
        }
        
        .badge-full {
          background: #f8d7da;
          color: #721c24;
        }
        
        .badge-approved {
          background: #d4edda;
          color: #155724;
        }
        
        .badge-pending {
          background: #fff3cd;
          color: #856404;
        }
        
        .badge-cancelled {
          background: #f8d7da;
          color: #721c24;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .data-table th,
        .data-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        
        .data-table tr:hover {
          background: #f5f5f5;
        }
        
        .booking-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          background: white;
        }
        
        .booking-info p {
          margin: 5px 0;
        }
        
        .booking-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .bookings-summary {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-label {
          display: block;
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 600;
          color: #007bff;
        }
        
        .reviews-list {
          display: grid;
          gap: 15px;
        }
        
        .review-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .reviewer-name {
          font-weight: 600;
          margin-right: 10px;
        }
        
        .review-date {
          color: #666;
          font-size: 12px;
        }
        
        .star {
          color: #ddd;
          font-size: 18px;
        }
        
        .star.filled {
          color: #ffc107;
        }
        
        .review-comment {
          margin: 10px 0;
          font-style: italic;
        }
        
        .review-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;