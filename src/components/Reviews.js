// components/Reviews.js
import React, { useState, useEffect } from 'react';
import { callAPI } from '../utils/api';

const Reviews = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  // Stats
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await callAPI({ action: 'getReviews' });
      setReviews(response);
      
      // Calculate stats
      if (response.length > 0) {
        const avg = response.reduce((acc, rev) => acc + rev.rating, 0) / response.length;
        setAverageRating(avg.toFixed(1));
        setTotalReviews(response.length);
      }
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await callAPI({
        action: 'submitReview',
        userId: user.id,
        rating: newReview.rating,
        comment: newReview.comment
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Thank you for your review!');
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        await fetchReviews();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to submit review');
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
        await fetchReviews();
      }
    } catch (err) {
      setError('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>Client Reviews</h1>
        <p>See what our clients say about us</p>
      </div>

      <div className="reviews-stats">
        <div className="stat-card">
          <div className="stat-value">{averageRating}</div>
          <div className="stat-label">Average Rating</div>
          <div className="stat-stars">{renderStars(Math.round(averageRating))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalReviews}</div>
          <div className="stat-label">Total Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(averageRating * 20).toFixed(0)}%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {user && !showReviewForm && (
        <div className="write-review-btn-container">
          <button 
            className="btn btn-primary"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </button>
        </div>
      )}

      {showReviewForm && (
        <div className="review-form-container">
          <h3>Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input">
                {[5,4,3,2,1].map(star => (
                  <label key={star} className="rating-label">
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      checked={newReview.rating === star}
                      onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    />
                    <span className={`star ${star <= newReview.rating ? 'filled' : ''}`}>★</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                placeholder="Share your experience with us..."
                rows="4"
                required
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.userName}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="review-comment">
                <p>"{review.comment}"</p>
              </div>
              {user?.isAdmin && (
                <div className="review-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={loading}
                  >
                    Delete Review
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;