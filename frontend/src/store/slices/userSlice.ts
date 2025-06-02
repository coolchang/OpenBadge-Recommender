import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
  email: string
  interests: string[]
  skills: string[]
  careerGoals: string[]
}

interface UserState {
  currentUser: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateInterests: (state, action: PayloadAction<string[]>) => {
      if (state.currentUser) {
        state.currentUser.interests = action.payload
      }
    },
    updateSkills: (state, action: PayloadAction<string[]>) => {
      if (state.currentUser) {
        state.currentUser.skills = action.payload
      }
    },
    updateCareerGoals: (state, action: PayloadAction<string[]>) => {
      if (state.currentUser) {
        state.currentUser.careerGoals = action.payload
      }
    },
  },
})

export const {
  setCurrentUser,
  setLoading,
  setError,
  updateInterests,
  updateSkills,
  updateCareerGoals,
} = userSlice.actions
export default userSlice.reducer 