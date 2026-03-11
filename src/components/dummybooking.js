import React, { useState } from 'react';

const MyBookings = ({ bookings, onCancel, onUpdate, loading, user }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'cancelled': 'badge-cancelled'
    };
    return <span className={`badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  const handleAction = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setReason('');
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (actionType === 'cancel') {
      onCancel(selectedBooking.id, reason);
    } else if (actionType === 'update') {
      onUpdate(selectedBooking.id, reason);
    }
    setShowModal(false);
    setSelectedBooking(null);
    setReason('');
  };

  // Format date for display (simple format)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // If it's already in YYYY-MM-DD format
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
  };

  // Format time for display (simple format)
  const formatTime = (timeString) => {
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
      
      // If it's an ISO string or other format
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
  };

  // Get the display date and time from booking data
  const getBookingDateTime = (booking) => {
    // Check if date is in the booking object directly
    if (booking.date && booking.start) {
      const formattedDate = formatDate(booking.date);
      const formattedTime = formatTime(booking.start);
      const formattedEndTime = formatTime(booking.end);
      
      return {
        date: formattedDate,
        start: formattedTime,
        end: formattedEndTime
      };
    }
    
    return {
      date: 'N/A',
      start: 'N/A',
      end: 'N/A'
    };
  };

  // Filter bookings (show all except past approved ones)
  const currentBookings = bookings
    .filter(booking => {
      // For now, show all bookings (you can add filtering logic if needed)
      return true;
    })
    .sort((a, b) => {
      // Sort by date if available
      if (a.date && b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      return 0;
    });

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      
      {currentBookings.length === 0 ? (
        <p className="no-bookings">You have no bookings.</p>
      ) : (
        <div className="bookings-list">
          {currentBookings.map(booking => {
            const dateTime = getBookingDateTime(booking);
            
            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <span className="booking-date">
                    {dateTime.date} • {dateTime.start} - {dateTime.end}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="booking-details">
                  <p><strong>User:</strong> {booking.userName || user?.name || 'N/A'}</p>
                  <p><strong>Chair Number:</strong> {booking.chairNo || 'N/A'}</p>
                  {booking.reason && (
                    <p><strong>Reason:</strong> {booking.reason}</p>
                  )}
                </div>
                {booking.status !== 'cancelled' && (
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAction(booking, 'update')}
                          disabled={loading}
                        >
                          Update Reason
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(booking, 'cancel')}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'approved' && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAction(booking, 'cancel')}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {actionType === 'cancel' ? 'Cancel Booking' : 'Update Booking Reason'}
            </h3>
            
            {selectedBooking && (
              <div className="modal-booking-info">
                <p><strong>User:</strong> {selectedBooking.userName || user?.name}</p>
                <p><strong>Chair:</strong> {selectedBooking.chairNo}</p>
                <p><strong>Date:</strong> {getBookingDateTime(selectedBooking).date}</p>
                <p><strong>Time:</strong> {getBookingDateTime(selectedBooking).start} - {getBookingDateTime(selectedBooking).end}</p>
                {selectedBooking.reason && actionType === 'update' && (
                  <p><strong>Current Reason:</strong> {selectedBooking.reason}</p>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="reason">
                {actionType === 'cancel' ? 'Reason for cancellation:' : 'Update reason:'}
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={actionType === 'cancel' 
                  ? "Please provide a reason for cancellation..." 
                  : "Please provide your updated reason..."}
                rows="3"
                className="modal-textarea"
                autoFocus
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Back
              </button>
              <button 
                className={`btn ${actionType === 'cancel' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirm}
                disabled={loading || !reason.trim()}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;