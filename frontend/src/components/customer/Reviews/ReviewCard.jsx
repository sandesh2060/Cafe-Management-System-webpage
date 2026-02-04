// frontend/src/components/customer/Reviews/ReviewCard.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ThumbsUp, CheckCircle } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const cardRef = useRef(null);
  const [helpful, setHelpful] = React.useState(review.helpful);
  const [isHelpful, setIsHelpful] = React.useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleHelpful = () => {
    gsap.to(cardRef.current, {
      scale: 0.98,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
    setIsHelpful(!isHelpful);
    setHelpful(isHelpful ? helpful - 1 : helpful + 1);
  };

  return (
    <div
      ref={cardRef}
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-white hover:shadow-lg transition"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-800">{review.order}</p>
            {review.verified && (
              <CheckCircle size={16} className="text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600">{review.item}</p>
        </div>

        {/* Rating */}
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={
                i < review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }
            />
          ))}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 mb-3 text-sm">{review.review}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">{review.date}</p>

        {/* Helpful Button */}
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            isHelpful
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <ThumbsUp size={14} />
          Helpful ({helpful})
        </button>
      </div>
    </div>
  );
};

// Import Star component
import { Star } from 'lucide-react';

export default ReviewCard;