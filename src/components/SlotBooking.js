import React, { useState, useMemo } from 'react';

const SlotBooking = ({ slots, onBookSlot, loading, user }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'today'

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle ISO string format
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
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
      
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // Handle ISO string format for time
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
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

  // Check if slot is in the past or current time is past start time
  const isSlotValid = (slot) => {
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
  };

  // Filter and sort slots
  const filteredAndSortedSlots = useMemo(() => {
    if (!slots || !Array.isArray(slots)) return [];
    
    // First filter out invalid (past) slots
    const validSlots = slots.filter(slot => isSlotValid(slot));
    
    // Apply additional filters
    let filteredSlots = validSlots;
    
    if (filter === 'available') {
      filteredSlots = validSlots.filter(slot => slot.available > 0);
    } else if (filter === 'today') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filteredSlots = validSlots.filter(slot => {
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
    return [...filteredSlots].sort((a, b) => {
      const dateA = a.date ? (a.date.includes('T') ? a.date.split('T')[0] : a.date) : '';
      const dateB = b.date ? (b.date.includes('T') ? b.date.split('T')[0] : b.date) : '';
      return new Date(dateA) - new Date(dateB);
    });
  }, [slots, filter]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setShowConfirm(true);
  };

  const handleConfirmBooking = () => {
    if (selectedSlot) {
      onBookSlot(selectedSlot.slotId);
      setShowConfirm(false);
      setSelectedSlot(null);
    }
  };

  // Show only valid future slots
  return (
    <div className="slot-booking">
      <h2>Available Slots</h2>
      
      {/* Filter Controls */}
      {filteredAndSortedSlots.length > 0 && (
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Future Slots
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available Only
          </button>
          <button 
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            Today's Slots
          </button>
        </div>
      )}
      
      {filteredAndSortedSlots.length === 0 ? (
        <p className="no-slots">No available slots found.</p>
      ) : (
        <div className="slots-grid">
          {filteredAndSortedSlots.map(slot => {
            const isFullyBooked = slot.available === 0;
            
            return (
              <div 
                key={slot.slotId} 
                className={`slot-card ${isFullyBooked ? 'fully-booked' : ''}`}
                onClick={() => !isFullyBooked && handleSlotClick(slot)}
              >
                <div className="slot-date">
                  {formatDate(slot.date)}
                </div>
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
              <p><strong>Chair Number:</strong> {(selectedSlot.booked || 0) + 1}</p>
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
        
        .no-slots {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default SlotBooking;