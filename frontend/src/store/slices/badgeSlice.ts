import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BadgeRecommendation {
  badge_id: string
  name: string
  issuer: string
  skills: string[]
  competency: string
  similarity_score: number
  recommendation_reason: string
  preparation_steps: string
  expected_benefits: string
}

interface BadgeState {
  recommendedBadges: BadgeRecommendation[]
  loading: boolean
  error: string | null
}

const initialState: BadgeState = {
  recommendedBadges: [],
  loading: false,
  error: null,
}

const badgeSlice = createSlice({
  name: 'badges',
  initialState,
  reducers: {
    setRecommendedBadges: (state, action: PayloadAction<BadgeRecommendation[]>) => {
      state.recommendedBadges = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setRecommendedBadges, setLoading, setError } = badgeSlice.actions
export default badgeSlice.reducer 