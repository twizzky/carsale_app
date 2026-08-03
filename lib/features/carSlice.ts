import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UserPreferences } from "../types"

interface CarState {
  userPreferences: UserPreferences | null
}

const initialState: CarState = {
  userPreferences: null,
}

const carSlice = createSlice({
  name: "car",
  initialState,
  reducers: {
    setUserPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.userPreferences = action.payload
    },
    clearUserPreferences: (state) => {
      state.userPreferences = null
    },
  },
})

export const { setUserPreferences, clearUserPreferences } = carSlice.actions
export default carSlice.reducer
