// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const getInitialUser = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(base64))
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    }
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

const initialState = {
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser()
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload) {
        state.user = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role
        }
      } else {
        state.user = null
      }
      state.isAuthenticated = !!action.payload
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  }
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer