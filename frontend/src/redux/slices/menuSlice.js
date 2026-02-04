// frontend/src/redux/slices/menuSlice.js
import { createSlice } from '@reduxjs/toolkit'

/**
 * Initial state for menu
 */
const initialState = {
  items: [],
  categories: [],
  filteredItems: [],
  selectedCategory: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,
  offers: [],
  discounts: [],
}

/**
 * Menu Slice
 * Manages menu items, categories, filtering, and search
 */
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Fetch menu start
    fetchMenuStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // Fetch menu success
    fetchMenuSuccess: (state, action) => {
      state.isLoading = false
      state.items = action.payload.items
      state.categories = action.payload.categories
      state.filteredItems = action.payload.items
      state.error = null
    },
    
    // Fetch menu failure
    fetchMenuFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Set selected category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
      
      // Filter items by category
      if (action.payload === 'all') {
        state.filteredItems = state.items
      } else {
        state.filteredItems = state.items.filter(
          (item) => item.category === action.payload
        )
      }
      
      // Apply search query if exists
      if (state.searchQuery) {
        state.filteredItems = state.filteredItems.filter((item) =>
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }
    },
    
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
      
      // Filter items by search query
      let filtered = state.items
      
      // Apply category filter first
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter((item) => item.category === state.selectedCategory)
      }
      
      // Apply search filter
      if (action.payload) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(action.payload.toLowerCase())
        )
      }
      
      state.filteredItems = filtered
    },
    
    // Clear search
    clearSearch: (state) => {
      state.searchQuery = ''
      
      // Reset to category filter only
      if (state.selectedCategory === 'all') {
        state.filteredItems = state.items
      } else {
        state.filteredItems = state.items.filter(
          (item) => item.category === state.selectedCategory
        )
      }
    },
    
    // Fetch offers start
    fetchOffersStart: (state) => {
      state.isLoading = true
    },
    
    // Fetch offers success
    fetchOffersSuccess: (state, action) => {
      state.isLoading = false
      state.offers = action.payload
    },
    
    // Fetch offers failure
    fetchOffersFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Fetch discounts start
    fetchDiscountsStart: (state) => {
      state.isLoading = true
    },
    
    // Fetch discounts success
    fetchDiscountsSuccess: (state, action) => {
      state.isLoading = false
      state.discounts = action.payload
    },
    
    // Fetch discounts failure
    fetchDiscountsFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Update menu item availability
    updateItemAvailability: (state, action) => {
      const { itemId, isAvailable } = action.payload
      
      const itemIndex = state.items.findIndex((item) => item.id === itemId)
      if (itemIndex >= 0) {
        state.items[itemIndex].isAvailable = isAvailable
      }
      
      const filteredIndex = state.filteredItems.findIndex((item) => item.id === itemId)
      if (filteredIndex >= 0) {
        state.filteredItems[filteredIndex].isAvailable = isAvailable
      }
    },
    
    // Add new menu item (for admin)
    addMenuItem: (state, action) => {
      state.items.push(action.payload)
      
      // Update filtered items if it matches current filter
      if (
        state.selectedCategory === 'all' ||
        action.payload.category === state.selectedCategory
      ) {
        if (
          !state.searchQuery ||
          action.payload.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        ) {
          state.filteredItems.push(action.payload)
        }
      }
    },
    
    // Update menu item (for admin)
    updateMenuItem: (state, action) => {
      const itemIndex = state.items.findIndex((item) => item.id === action.payload.id)
      if (itemIndex >= 0) {
        state.items[itemIndex] = action.payload
      }
      
      const filteredIndex = state.filteredItems.findIndex(
        (item) => item.id === action.payload.id
      )
      if (filteredIndex >= 0) {
        state.filteredItems[filteredIndex] = action.payload
      }
    },
    
    // Delete menu item (for admin)
    deleteMenuItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      state.filteredItems = state.filteredItems.filter(
        (item) => item.id !== action.payload
      )
    },
    
    // Clear menu error
    clearMenuError: (state) => {
      state.error = null
    },
    
    // Reset menu state
    resetMenuState: (state) => {
      state.selectedCategory = 'all'
      state.searchQuery = ''
      state.filteredItems = state.items
    },
  },
})

export const {
  fetchMenuStart,
  fetchMenuSuccess,
  fetchMenuFailure,
  setSelectedCategory,
  setSearchQuery,
  clearSearch,
  fetchOffersStart,
  fetchOffersSuccess,
  fetchOffersFailure,
  fetchDiscountsStart,
  fetchDiscountsSuccess,
  fetchDiscountsFailure,
  updateItemAvailability,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  clearMenuError,
  resetMenuState,
} = menuSlice.actions

export default menuSlice.reducer