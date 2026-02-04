// frontend/src/redux/slices/loyaltySlice.js
import { createSlice } from '@reduxjs/toolkit'

/**
 * Initial state for loyalty program
 */
const initialState = {
  tokens: 0,
  totalEarned: 0,
  totalRedeemed: 0,
  tier: 'bronze', // 'bronze', 'silver', 'gold', 'platinum'
  transactions: [],
  availableRewards: [],
  redeemedRewards: [],
  isLoading: false,
  error: null,
  freeItemsEligible: [],
  tokensToNextReward: 0,
  nextRewardAt: 0,
}

/**
 * Loyalty Slice
 * Manages customer loyalty points, rewards, and redemptions
 */
const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    // Fetch loyalty data start
    fetchLoyaltyStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // Fetch loyalty data success
    fetchLoyaltySuccess: (state, action) => {
      state.isLoading = false
      state.tokens = action.payload.tokens
      state.totalEarned = action.payload.totalEarned
      state.totalRedeemed = action.payload.totalRedeemed
      state.tier = action.payload.tier
      state.transactions = action.payload.transactions || []
      state.freeItemsEligible = action.payload.freeItemsEligible || []
      state.tokensToNextReward = action.payload.tokensToNextReward || 0
      state.nextRewardAt = action.payload.nextRewardAt || 0
      state.error = null
    },
    
    // Fetch loyalty data failure
    fetchLoyaltyFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Earn tokens
    earnTokens: (state, action) => {
      const { tokens, orderId, orderAmount } = action.payload
      
      state.tokens += tokens
      state.totalEarned += tokens
      
      // Add transaction
      state.transactions.unshift({
        id: Date.now(),
        type: 'earned',
        tokens,
        orderId,
        orderAmount,
        date: new Date().toISOString(),
      })
      
      // Update tokens to next reward
      if (state.nextRewardAt > 0) {
        state.tokensToNextReward = Math.max(0, state.nextRewardAt - state.tokens)
      }
    },
    
    // Redeem tokens
    redeemTokens: (state, action) => {
      const { tokens, rewardId, rewardName } = action.payload
      
      if (state.tokens >= tokens) {
        state.tokens -= tokens
        state.totalRedeemed += tokens
        
        // Add transaction
        state.transactions.unshift({
          id: Date.now(),
          type: 'redeemed',
          tokens,
          rewardId,
          rewardName,
          date: new Date().toISOString(),
        })
        
        // Add to redeemed rewards
        state.redeemedRewards.unshift({
          id: rewardId,
          name: rewardName,
          tokens,
          redeemedAt: new Date().toISOString(),
        })
        
        // Update tokens to next reward
        if (state.nextRewardAt > 0) {
          state.tokensToNextReward = Math.max(0, state.nextRewardAt - state.tokens)
        }
      }
    },
    
    // Fetch available rewards
    fetchRewardsStart: (state) => {
      state.isLoading = true
    },
    
    fetchRewardsSuccess: (state, action) => {
      state.isLoading = false
      state.availableRewards = action.payload
    },
    
    fetchRewardsFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Update loyalty tier
    updateTier: (state, action) => {
      state.tier = action.payload
    },
    
    // Set free items eligible for redemption
    setFreeItemsEligible: (state, action) => {
      state.freeItemsEligible = action.payload
    },
    
    // Claim free item
    claimFreeItem: (state, action) => {
      const { itemId, tokensRequired } = action.payload
      
      if (state.tokens >= tokensRequired) {
        state.tokens -= tokensRequired
        state.totalRedeemed += tokensRequired
        
        // Add transaction
        state.transactions.unshift({
          id: Date.now(),
          type: 'redeemed',
          tokens: tokensRequired,
          itemId,
          description: 'Free item claimed',
          date: new Date().toISOString(),
        })
        
        // Update tokens to next reward
        if (state.nextRewardAt > 0) {
          state.tokensToNextReward = Math.max(0, state.nextRewardAt - state.tokens)
        }
      }
    },
    
    // Add loyalty transaction (for manual adjustments)
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    
    // Clear loyalty error
    clearLoyaltyError: (state) => {
      state.error = null
    },
    
    // Reset loyalty state
    resetLoyaltyState: (state) => {
      return initialState
    },
    
    // Set tokens to next reward
    setTokensToNextReward: (state, action) => {
      state.tokensToNextReward = action.payload.tokensToNextReward
      state.nextRewardAt = action.payload.nextRewardAt
    },
  },
})

export const {
  fetchLoyaltyStart,
  fetchLoyaltySuccess,
  fetchLoyaltyFailure,
  earnTokens,
  redeemTokens,
  fetchRewardsStart,
  fetchRewardsSuccess,
  fetchRewardsFailure,
  updateTier,
  setFreeItemsEligible,
  claimFreeItem,
  addTransaction,
  clearLoyaltyError,
  resetLoyaltyState,
  setTokensToNextReward,
} = loyaltySlice.actions

export default loyaltySlice.reducer