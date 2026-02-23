// ================================================================
// FILE: frontend/src/modules/customer/hooks/useSplitBill.js
// SPLIT BILL HOOK - Payment Split Logic
// ================================================================

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useSplitBill = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Submit split payment
   */
  const submitSplitPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/billing/process', paymentData);

      if (response.data.success) {
        toast.success('Payment processed successfully! 🎉');
        setLoading(false);
        return {
          success: true,
          order: response.data.data.order,
          transactions: response.data.data.transactions
        };
      }
    } catch (err) {
      console.error('Split payment error:', err);
      const errorMsg = err.response?.data?.message || 'Payment failed';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return {
        success: false,
        error: errorMsg
      };
    }
  };

  /**
   * Calculate equal split
   */
  const calculateEqualSplit = (total, people) => {
    if (people.length === 0) return [];
    
    const perPerson = total / people.length;
    
    return people.map(person => ({
      name: person.name || person,
      amount: parseFloat(perPerson.toFixed(2)),
      percentage: parseFloat((100 / people.length).toFixed(2))
    }));
  };

  /**
   * Calculate unequal split (random)
   */
  const calculateUnequalSplit = (total, people) => {
    if (people.length === 0) return [];
    if (people.length === 1) {
      return [{
        name: people[0].name || people[0],
        amount: total,
        percentage: 100
      }];
    }

    // Generate random percentages that sum to 100
    const randomPercentages = generateRandomPercentages(people.length);
    
    // Calculate amounts
    let splits = people.map((person, index) => ({
      name: person.name || person,
      percentage: randomPercentages[index],
      amount: parseFloat((total * randomPercentages[index] / 100).toFixed(2))
    }));

    // Adjust last person to account for rounding
    const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
    const diff = total - totalSplit;
    if (Math.abs(diff) > 0) {
      splits[splits.length - 1].amount += diff;
      splits[splits.length - 1].amount = parseFloat(splits[splits.length - 1].amount.toFixed(2));
    }

    return splits;
  };

  /**
   * Generate random percentages that sum to 100
   */
  const generateRandomPercentages = (count) => {
    // Generate random numbers
    const randoms = Array.from({ length: count }, () => Math.random());
    const sum = randoms.reduce((a, b) => a + b, 0);
    
    // Normalize to sum to 100
    const percentages = randoms.map(r => (r / sum) * 100);
    
    // Round to 2 decimals
    const rounded = percentages.map(p => parseFloat(p.toFixed(2)));
    
    // Adjust last one to ensure exact 100%
    const roundedSum = rounded.reduce((a, b) => a + b, 0);
    rounded[rounded.length - 1] += 100 - roundedSum;
    rounded[rounded.length - 1] = parseFloat(rounded[rounded.length - 1].toFixed(2));
    
    return rounded;
  };

  /**
   * Validate custom split
   */
  const validateCustomSplit = (splits, total) => {
    const totalSplit = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
    return Math.abs(totalSplit - total) < 0.01;
  };

  /**
   * Get highest payer (fun teasing feature)
   */
  const getHighestPayer = (splits) => {
    if (!splits || splits.length === 0) return null;
    return splits.reduce((max, s) => 
      s.amount > max.amount ? s : max, 
      splits[0]
    );
  };

  /**
   * Get lowest payer (fun teasing feature)
   */
  const getLowestPayer = (splits) => {
    if (!splits || splits.length === 0) return null;
    return splits.reduce((min, s) => 
      s.amount < min.amount ? s : min, 
      splits[0]
    );
  };

  /**
   * Get split emoji based on percentage
   */
  const getSplitEmoji = (percentage) => {
    if (percentage >= 40) return '💰'; // Rich contributor
    if (percentage >= 30) return '🤝'; // Fair sharer
    if (percentage >= 20) return '😊'; // Moderate payer
    if (percentage >= 10) return '😅'; // Light payer
    return '🤏'; // Minimum contributor
  };

  /**
   * Get fun message for split
   */
  const getFunMessage = (split, total) => {
    const percentage = (split.amount / total * 100).toFixed(1);
    
    if (percentage >= 50) {
      return `${split.name} is the MVP! 🏆 Paying ${percentage}%`;
    } else if (percentage >= 40) {
      return `${split.name} is being generous! 💫`;
    } else if (percentage >= 30) {
      return `${split.name} is doing their fair share 🤝`;
    } else if (percentage >= 20) {
      return `${split.name} is contributing 😊`;
    } else if (percentage >= 10) {
      return `${split.name} got a good deal! 😄`;
    } else {
      return `${split.name} got lucky! 🍀`;
    }
  };

  return {
    submitSplitPayment,
    calculateEqualSplit,
    calculateUnequalSplit,
    validateCustomSplit,
    getHighestPayer,
    getLowestPayer,
    getSplitEmoji,
    getFunMessage,
    loading,
    error
  };
};