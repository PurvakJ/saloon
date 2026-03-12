import React, { useState, useEffect, useCallback, useRef } from 'react';
import { callAPI } from '../utils/api';
import SlotBooking from './SlotBooking';
import MyBookings from './MyBookings';

const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('book');
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Refs for auto-refresh
  const refreshIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const isRefreshingRef = useRef(false);

  // Background refresh function - doesn't set main loading state
  const backgroundFetchData = useCallback(async () => {
    if (isRefreshingRef.current || !isMountedRef.current) return;
    
    isRefreshingRef.current = true;
    setBackgroundLoading(true);
    
    try {
      // Fetch both slots and bookings in parallel
      const [slotsRes, bookingsRes] = await Promise.all([
        callAPI({ action: 'getSlots' }),
        callAPI({ action: 'getBookings', userId: user.id })
      ]);
      
      if (isMountedRef.current) {
        setSlots(slotsRes);
        setBookings(bookingsRes);
        setLastRefreshed(new Date());
        console.log('Background refresh completed:', new Date().toLocaleTimeString());
      }
    } catch (err) {
      if (isMountedRef.current) {
        // Don't show error for background refresh to avoid interrupting user
        console.error('Background refresh failed:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setBackgroundLoading(false);
      }
      isRefreshingRef.current = false;
    }
  }, [user.id]);

  // Initial full load with loading state
  const initialFetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        callAPI({ action: 'getSlots' }),
        callAPI({ action: 'getBookings', userId: user.id })
      ]);
      
      if (isMountedRef.current) {
        setSlots(slotsRes);
        setBookings(bookingsRes);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to fetch data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user.id]);

  // Manual refresh handler - uses background refresh
  const handleManualRefresh = useCallback(() => {
    backgroundFetchData();
  }, [backgroundFetchData]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    initialFetchData();
    
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [initialFetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Set new interval
      refreshIntervalRef.current = setInterval(() => {
        if (isMountedRef.current && !isRefreshingRef.current) {
          console.log('Auto-refreshing data in background...');
          backgroundFetchData();
        }
      }, 10000); // 10 seconds
    } else {
      // Clear interval if auto-refresh is disabled
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, backgroundFetchData]);

  const handleBookSlot = async (slotId, reason) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await callAPI({
        action: 'bookSlot',
        userId: user.id,
        userName: user.name,
        slotId: slotId,
        reason: reason
      });

      if (response.error) {
        setError(response.error);
      } else {
        // Use background refresh after action
        await backgroundFetchData();
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
        // Use background refresh after action
        await backgroundFetchData();
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
        // Use background refresh after action
        await backgroundFetchData();
      }
    } catch (err) {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format last refreshed time
  const formatLastRefreshed = useCallback(() => {
    return lastRefreshed.toLocaleTimeString();
  }, [lastRefreshed]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <div className="refresh-controls">
          <div className="refresh-info">
            <span className="last-refreshed">Last refreshed: {formatLastRefreshed()}</span>
            {backgroundLoading && (
              <span className="background-loading-indicator">
                <span className="spinner-small"></span>
                Refreshing...
              </span>
            )}
            <button 
              className={`refresh-toggle-btn ${autoRefresh ? 'active' : ''}`}
              onClick={toggleAutoRefresh}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              disabled={loading}
            >
              <span className="refresh-icon">⟳</span>
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button 
              className="refresh-btn"
              onClick={handleManualRefresh}
              disabled={loading || backgroundLoading}
              title="Refresh manually"
            >
              <span className="refresh-icon">↻</span>
              Refresh Now
            </button>
          </div>
        </div>
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
            disabled={loading}
          >
            Book Appointment
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mybookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mybookings')}
            disabled={loading}
          >
            My Bookings {bookings.length > 0 && `(${bookings.length})`}
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
            user={user}
          />
        )}
        {activeTab === 'mybookings' && (
          <MyBookings 
            bookings={bookings}
            onCancel={handleCancelBooking}
            onUpdate={handleUpdateBooking}
            loading={loading}
            user={user}
          />
        )}
      </div>

      <style jsx>{`
        .refresh-controls {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .refresh-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .last-refreshed {
          font-size: 12px;
          color: #666;
        }
        
        .background-loading-indicator {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #007bff;
        }
        
        .spinner-small {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #007bff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .refresh-toggle-btn,
        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }
        
        .refresh-toggle-btn:hover:not(:disabled),
        .refresh-btn:hover:not(:disabled) {
          background: #f0f0f0;
        }
        
        .refresh-toggle-btn.active {
          background: #28a745;
          color: white;
          border-color: #218838;
        }
        
        .refresh-toggle-btn:disabled,
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .refresh-icon {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;