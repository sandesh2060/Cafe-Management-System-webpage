import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchMenu = createAsyncThunk(
  'menu/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/menu');
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMenuItemById = createAsyncThunk(
  'menu/fetchById',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu item');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    categories: [],
    selectedItem: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch menu
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        
        // Extract unique categories
        const uniqueCategories = [...new Set(action.payload.map(item => item.category))];
        state.categories = uniqueCategories;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch menu item by ID
      .addCase(fetchMenuItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchMenuItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedItem, clearSelectedItem, setCategories } = menuSlice.actions;
export default menuSlice.reducer;