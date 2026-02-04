// frontend/src/components/customer/Reviews/Reviews.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star, Send, ThumbsUp, MessageCircle } from 'lucide-react';
import ReviewCard from './ReviewCard';

const Reviews = () => {
  const [reviews] = useState([
    {
      id: 1,
      order: '#ORD-12345',
      item: 'Margherita Pizza',
      rating: 5,
      review: 'Amazing pizza! Perfect crust and fresh ingredients. Highly recommend!',
      helpful: 12,
      date: '2 days ago',
      verified: true,
    },
    {
      id: 2,
      order: '#ORD-12344',
      item: 'Grilled Salmon',
      rating: 4,
      review: 'Great taste but portion could be slightly larger.',
      helpful: 8,
      date: '5 days ago',
      verified: true,
    },
    {
      id: 3,
      order: '#ORD-12343',
      item: 'Spaghetti Carbonara',
      rating: 5,
      review: 'Best carbonara I have ever had! Creamy and delicious.',
      helpful: 15,
      date: '1 week ago',
      verified: true,
    },
  ]);

  const [newReview, setNewReview] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const containerRef = useRef(null);
  const reviewsRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        reviewsRef.current?.children,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        },
        0.2
      );
    },
    { revertOnUpdate: true }
  );

  const handleSubmitReview = () => {
    if (newReview.trim()) {
      gsap.to(containerRef.current, {
        scale: 0.98,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
      setNewReview('');
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Reviews</h2>
        <p className="text-gray-600">
          Share your feedback to help others discover great food
        </p>
      </div>

      {/* New Review Form */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-lg text-blue-900">Write a Review</h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Your Rating:</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(star)}
                className="transition transform hover:scale-125"
              >
                <Star
                  size={28}
                  className={
                    star <= selectedRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Thoughts
          </label>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Tell us what you thought about this dish..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitReview}
          disabled={!newReview.trim()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
        >
          <Send size={18} />
          Post Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">
          All Reviews ({reviews.length})
        </h3>

        <div ref={reviewsRef} className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">Your Review Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">4.7</p>
            <p className="text-xs text-gray-600">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{reviews.length}</p>
            <p className="text-xs text-gray-600">Reviews Written</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">35</p>
            <p className="text-xs text-gray-600">Helpful Votes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">Top</p>
            <p className="text-xs text-gray-600">Reviewer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;