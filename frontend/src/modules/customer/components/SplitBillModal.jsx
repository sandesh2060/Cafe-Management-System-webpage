// ================================================================
// FILE: frontend/src/modules/customer/components/SplitBillModal.jsx
// FUN SPLIT BILL MODAL - With GSAP Animations
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSplitBill } from '../hooks/useSplitBill';
import './SplitBillModal.css';

const SplitBillModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  total,
  orderId,
  theme = 'light'
}) => {
  const [splitMode, setSplitMode] = useState(null); // null, 'single', 'group'
  const [people, setPeople] = useState([]);
  const [splits, setSplits] = useState([]);
  const [splitType, setSplitType] = useState('equal'); // 'equal' or 'unequal'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  const modalRef = useRef(null);
  const modeCardsRef = useRef([]);
  const splitCardsRef = useRef([]);
  const peopleInputsRef = useRef([]);

  const {
    calculateEqualSplit,
    calculateUnequalSplit,
    getHighestPayer,
    getLowestPayer,
    getSplitEmoji,
    getFunMessage,
    validateCustomSplit
  } = useSplitBill();

  // Modal entrance animation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }, modalRef);

      return () => ctx.revert();
    }
  }, [isOpen]);

  // Animate mode selection
  useEffect(() => {
    if (splitMode === null && modeCardsRef.current.length > 0) {
      gsap.fromTo(
        modeCardsRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, [splitMode]);

  // Animate people inputs
  useEffect(() => {
    if (peopleInputsRef.current.length > 0) {
      gsap.fromTo(
        peopleInputsRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out'
        }
      );
    }
  }, [people.length]);

  // Animate splits display
  useEffect(() => {
    if (splits.length > 0 && splitCardsRef.current.length > 0) {
      gsap.fromTo(
        splitCardsRef.current,
        { scale: 0, y: 30, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.5)'
        }
      );
    }
  }, [splits]);

  // Handle mode selection
  const handleModeSelect = (mode) => {
    // Animate out mode cards
    gsap.to(modeCardsRef.current, {
      scale: 0,
      rotation: 180,
      duration: 0.3,
      stagger: 0.1,
      ease: 'back.in(1.7)',
      onComplete: () => {
        setSplitMode(mode);
        if (mode === 'single') {
          setPeople([{ name: 'You' }]);
          setSplits([{ name: 'You', amount: total, percentage: 100 }]);
        }
      }
    });
  };

  // Add person
  const addPerson = () => {
    setPeople([...people, { name: '' }]);
  };

  // Remove person
  const removePerson = (index) => {
    const newPeople = people.filter((_, i) => i !== index);
    setPeople(newPeople);
    if (newPeople.length > 0) {
      calculateSplits(newPeople);
    } else {
      setSplits([]);
    }
  };

  // Update person name
  const updatePersonName = (index, name) => {
    const newPeople = [...people];
    newPeople[index] = { name };
    setPeople(newPeople);
  };

  // Calculate splits
  const calculateSplits = (peopleList = people) => {
    if (peopleList.length === 0) return;

    let newSplits;
    if (splitType === 'equal') {
      newSplits = calculateEqualSplit(total, peopleList);
    } else {
      newSplits = calculateUnequalSplit(total, peopleList);
    }
    setSplits(newSplits);
  };

  // Handle split type change
  const handleSplitTypeChange = (type) => {
    // Bounce animation on type change
    gsap.to(splitCardsRef.current, {
      y: -10,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });

    setSplitType(type);
    setTimeout(() => calculateSplits(), 100);
  };

  // Randomize splits (fun feature!)
  const randomizeSplits = () => {
    // Spin animation
    gsap.to(splitCardsRef.current, {
      rotationY: 360,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        const newSplits = calculateUnequalSplit(total, people);
        setSplits(newSplits);
      }
    });
  };

  // Confirm and proceed
  const handleConfirm = () => {
    if (splits.length === 0) {
      alert('Please add people and calculate splits');
      return;
    }

    // Success animation
    gsap.to(modalRef.current, {
      scale: 1.05,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        onConfirm({
          splitMode: splitMode === 'single' ? 'single' : 'group',
          splits: splits.map(s => ({
            ...s,
            method: selectedPaymentMethod
          })),
          orderId
        });
      }
    });
  };

  if (!isOpen) return null;

  const highest = getHighestPayer(splits);
  const lowest = getLowestPayer(splits);

  return (
    <div className={`split-modal-overlay ${theme}`} onClick={onClose}>
      <div 
        ref={modalRef}
        className={`split-modal ${theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2 className="split-title">💰 Split the Bill</h2>
        <p className="split-total">Total: Rs. {total.toFixed(2)}</p>

        {/* Mode Selection */}
        {splitMode === null && (
          <div className="mode-selection">
            <h3>Who's paying?</h3>
            <div className="mode-cards">
              <div
                ref={el => modeCardsRef.current[0] = el}
                className="mode-card"
                onClick={() => handleModeSelect('single')}
              >
                <div className="mode-icon">👤</div>
                <h4>Just Me</h4>
                <p>I'll pay the full amount</p>
              </div>
              <div
                ref={el => modeCardsRef.current[1] = el}
                className="mode-card"
                onClick={() => handleModeSelect('group')}
              >
                <div className="mode-icon">👥</div>
                <h4>Friends Group</h4>
                <p>Split with friends</p>
              </div>
            </div>
          </div>
        )}

        {/* Group Split */}
        {splitMode === 'group' && (
          <div className="group-split-section">
            {/* Split Type Toggle */}
            <div className="split-type-toggle">
              <button
                className={`toggle-btn ${splitType === 'equal' ? 'active' : ''}`}
                onClick={() => handleSplitTypeChange('equal')}
              >
                🤝 Equal Split
              </button>
              <button
                className={`toggle-btn ${splitType === 'unequal' ? 'active' : ''}`}
                onClick={() => handleSplitTypeChange('unequal')}
              >
                🎲 Random Split
              </button>
            </div>

            {/* People List */}
            <div className="people-section">
              <h3>Add Friends</h3>
              {people.map((person, index) => (
                <div
                  key={index}
                  ref={el => peopleInputsRef.current[index] = el}
                  className="person-input-row"
                >
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePersonName(index, e.target.value)}
                    placeholder={`Friend ${index + 1}`}
                    className="person-input"
                  />
                  <button
                    className="remove-btn"
                    onClick={() => removePerson(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button className="add-person-btn" onClick={addPerson}>
                ➕ Add Friend
              </button>
            </div>

            {/* Calculate Button */}
            {people.length > 0 && (
              <div className="calculate-section">
                <button 
                  className="calculate-btn"
                  onClick={() => calculateSplits()}
                >
                  🧮 Calculate Split
                </button>
                {splitType === 'unequal' && splits.length > 0 && (
                  <button 
                    className="randomize-btn"
                    onClick={randomizeSplits}
                  >
                    🎲 Randomize Again!
                  </button>
                )}
              </div>
            )}

            {/* Splits Display */}
            {splits.length > 0 && (
              <div className="splits-display">
                <h3>Split Breakdown</h3>
                <div className="splits-grid">
                  {splits.map((split, index) => (
                    <div
                      key={index}
                      ref={el => splitCardsRef.current[index] = el}
                      className="split-card"
                    >
                      <div className="split-emoji">{getSplitEmoji(split.percentage)}</div>
                      <div className="split-info">
                        <h4>{split.name || `Person ${index + 1}`}</h4>
                        <p className="split-amount">Rs. {split.amount.toFixed(2)}</p>
                        <p className="split-percentage">{split.percentage.toFixed(1)}%</p>
                        <p className="split-message">{getFunMessage(split, total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fun Stats */}
                {splitType === 'unequal' && highest && lowest && (
                  <div className="fun-stats">
                    <p className="stat-highest">
                      🏆 <strong>{highest.name}</strong> is paying the most (Rs. {highest.amount.toFixed(2)})
                    </p>
                    <p className="stat-lowest">
                      🍀 <strong>{lowest.name}</strong> got the best deal (Rs. {lowest.amount.toFixed(2)})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Single Payment */}
        {splitMode === 'single' && splits.length > 0 && (
          <div className="single-payment-section">
            <div className="single-card">
              <div className="single-icon">💰</div>
              <h3>You're paying the full amount</h3>
              <p className="single-amount">Rs. {total.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        {splits.length > 0 && (
          <div className="payment-method-section">
            <h3>Payment Method</h3>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="payment-method-select"
            >
              <option value="esewa">📱 eSewa</option>
              <option value="khalti">💜 Khalti</option>
              <option value="mobile_banking">🏦 Mobile Banking</option>
              <option value="cash">💵 Cash</option>
            </select>
          </div>
        )}

        {/* Confirm Button */}
        {splits.length > 0 && (
          <button className="confirm-btn" onClick={handleConfirm}>
            ✓ Confirm & Pay
          </button>
        )}
      </div>
    </div>
  );
};

export default SplitBillModal;