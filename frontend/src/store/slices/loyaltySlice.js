import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchLoyaltyPoints = createAsyncThunk(
  'loyalty/fetchPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/loyalty/points');
      
      if (!response.ok) {
        throw new Error('Failed to fetch loyalty points');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const redeemReward = createAsyncThunk(
  'loyalty/redeem',
  async (rewardId, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRewards = createAsyncThunk(
  'loyalty/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/loyalty/rewards');
      
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    points: 0,
    tier: 'bronze',
    rewards: [],
    history: [],
    loading: false,
    error: null,
  },
  reducers: {
    addPoints: (state, action) => {
      state.points += action.payload;
    },
    setTier: (state, action) => {
      state.tier = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loyalty points
      .addCase(fetchLoyaltyPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoyaltyPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.points = action.payload.points;
        state.tier = action.payload.tier;
        state.history = action.payload.history || [];
      })
      .addCase(fetchLoyaltyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Redeem reward
      .addCase(redeemReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.loading = false;
        state.points = action.payload.remainingPoints;
        state.history.unshift(action.payload.transaction);
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addPoints, setTier } = loyaltySlice.actions;
export default loyaltySlice.reducer;