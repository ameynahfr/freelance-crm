import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper to set the token in Axios headers globally
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Initial State: Check if we already have a token saved
const token = localStorage.getItem("token");
if (token) setAuthToken(token);

const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// --- ASYNC ACTIONS (THUNKS) ---

// Login Action
export const login = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", userData);
    setAuthToken(res.data.token); // Save to LS & Headers
    return res.data; // Payload for the reducer
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// Register Action
export const register = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/register", userData);
    setAuthToken(res.data.token);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

// Logout Action (No async needed, just cleanup)
export const logout = createAsyncThunk("auth/logout", async () => {
  setAuthToken(null); // Clear LS & Headers
  return null;
});

// Load User Action (for page refreshes)
export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunkAPI) => {
  const token = localStorage.getItem("token");
  if (!token) return thunkAPI.rejectWithValue("No token");

  try {
    setAuthToken(token);
    const res = await axios.get("http://localhost:5000/api/auth/profile");
    return res.data;
  } catch (err) {
    setAuthToken(null);
    return thunkAPI.rejectWithValue("Session expired");
  }
});

// --- SLICE ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Standard reducer to clear errors manually if needed
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload; // Contains _id, name, email
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // LOAD USER
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearErrors } = authSlice.actions;
export default authSlice.reducer;