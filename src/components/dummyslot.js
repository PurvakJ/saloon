import React, { useState, useMemo } from 'react';

const SlotBooking = ({ slots, onBookSlot, loading, user }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // If it's in YYYY-MM-DD format
      if (dateString.includes('-') && dateString.length === 10) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // If it's an ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format time for display
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
  };

  // Format time range
  const formatTimeRange = (start, end) => {
    const formattedStart = formatTime(start);
    const formattedEnd = formatTime(end);
    return `${formattedStart} - ${formattedEnd}`;
  };

  // Check if slot is valid for booking (end time > current time and date is not past)
  const isValidSlot = (date, endTime) => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Parse date and end time properly
      const [year, month, day] = date.split('-').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      // Create end datetime object
      const slotEndDateTime = new Date(year, month - 1, day, endHours, endMinutes);
      
      // Check if date is in the past (compare dates without time)
      if (date < currentDate) {
        return false; // Past date, don't show
      }
      
      // If it's today, check if end time is greater than current time
      if (date === currentDate) {
        return slotEndDateTime > now;
      }
      
      // Future dates are always valid
      return true;
    } catch (error) {
      console.error('Error checking slot validity:', error);
      return false;
    }
  };

  // Filter slots to show only valid ones
  const validSlots = useMemo(() => {
    return slots.filter(slot => isValidSlot(slot.date, slot.end));
  }, [slots]);

  // Group valid slots by date
  const groupedSlots = validSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedSlots).sort((a, b) => {
    // Handle YYYY-MM-DD format
    if (a.includes('-') && b.includes('-')) {
      return new Date(a) - new Date(b);
    }
    return 0;
  });

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setShowConfirm(true);
  };

  const handleConfirmBooking = () => {
    onBookSlot(selectedSlot.slotId);
    setShowConfirm(false);
    setSelectedSlot(null);
  };

  return (
    <div className="slot-booking">
      <h2>Available Slots</h2>
      
      {sortedDates.length === 0 ? (
        <p className="no-slots">No available slots at the moment.</p>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="date-group">
            <h3>{formatDate(date)}</h3>
            <div className="slots-grid">
              {groupedSlots[date]
                .sort((a, b) => a.start.localeCompare(b.start))
                .map(slot => {
                  const isFullyBooked = slot.available === 0;
                  
                  return (
                    <div 
                      key={slot.slotId} 
                      className={`slot-card ${isFullyBooked ? 'fully-booked' : ''}`}
                      onClick={() => !isFullyBooked && handleSlotClick(slot)}
                    >
                      <div className="slot-time">
                        {formatTimeRange(slot.start, slot.end)}
                      </div>
                      <div className="slot-availability">
                        <span className={`available ${slot.available > 0 ? 'yes' : 'no'}`}>
                          {slot.available} / {slot.chairs} Available
                        </span>
                      </div>
                      {isFullyBooked && (
                        <div className="booked-label">Fully Booked</div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      )}

      {showConfirm && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Booking</h3>
            <div className="modal-user-info">
              <p><strong>User:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            </div>
            <div className="modal-booking-details">
              <p><strong>Date:</strong> {formatDate(selectedSlot.date)}</p>
              <p><strong>Time:</strong> {formatTimeRange(selectedSlot.start, selectedSlot.end)}</p>
              <p><strong>Chair Number:</strong> {selectedSlot.booked + 1}</p>
              <p><strong>Status:</strong> <span className="badge-pending">Pending Approval</span></p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotBooking;