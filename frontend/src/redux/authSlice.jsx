import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  loginUser, 
  registerUser, 
  getProfile, 
  updateProfile as updateProfileApi 
} from "../api/authApi";

// --- ASYNC ACTIONS ---

export const login = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    const res = await loginUser(userData);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {
    const res = await registerUser(userData);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunkAPI) => {
  try {
    const res = await getProfile();
    return res.data;
  } catch (err) {
    localStorage.removeItem("token");
    return thunkAPI.rejectWithValue("Session expired");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (userData, thunkAPI) => {
  try {
    const res = await updateProfileApi(userData);
    return res.data; 
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
  },
  reducers: {
    clearErrors: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // 1️⃣ ALWAYS CALL addCase FIRST
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      
      // 2️⃣ CALL addMatcher AFTER ALL addCases
      .addMatcher((action) => action.type.endsWith("/pending"), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith("/rejected"), (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If profile loading fails, we clear the session
        if (action.type.includes("loadUser")) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const { clearErrors } = authSlice.actions;
export default authSlice.reducer;