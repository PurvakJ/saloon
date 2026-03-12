import React, { useState } from 'react';

const MyBookings = ({ bookings, onCancel, onUpdate, loading, user }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'cancelled'

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

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  }).sort((a, b) => {
    // Sort by date if available
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      
      {/* Filter Controls */}
      {bookings.length > 0 && (
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            disabled={loading}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
            disabled={loading}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
            disabled={loading}
          >
            Approved
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
            disabled={loading}
          >
            Cancelled
          </button>
        </div>
      )}
      
      {filteredBookings.length === 0 ? (
        <p className="no-bookings">You have no bookings in this category.</p>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => {
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
                disabled={loading}
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
          font-size: 14px;
        }
        
        .filter-btn:hover:not(:disabled) {
          background: #f0f0f0;
        }
        
        .filter-btn.active {
          background: #007bff;
          color: white;
          border-color: #0056b3;
        }
        
        .filter-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .no-bookings {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 16px;
        }
        
        .bookings-list {
          display: grid;
          gap: 15px;
        }
        
        .booking-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }
        
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .booking-date {
          font-weight: 600;
          color: #333;
        }
        
        .booking-details p {
          margin: 5px 0;
          color: #666;
        }
        
        .booking-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .badge-pending {
          background: #fff3cd;
          color: #856404;
        }
        
        .badge-approved {
          background: #d4edda;
          color: #155724;
        }
        
        .badge-cancelled {
          background: #f8d7da;
          color: #721c24;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          padding: 24px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .modal-booking-info {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          margin: 15px 0;
        }
        
        .modal-booking-info p {
          margin: 5px 0;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }
        
        .modal-textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }
        
        .modal-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default MyBookings;