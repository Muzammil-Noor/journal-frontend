import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface LoginResponse {
    token: string;
}

interface ErrorResponse {
    message: string;
}

interface AuthState {
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isLoggedin: boolean;
}

const initialState: AuthState = {
    token: null,
    isLoading: false,
    error: null,
    isLoggedin: false,
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  { pin:string },
  { rejectValue: ErrorResponse }
>("auth/loginUser", async ({ pin }, thunkAPI) => {
  try {
    const response = await axios.post<LoginResponse>(
      `${import.meta.env.VITE_API_BASE_URL}/api/pin/verify`,
      { pin },
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      message: error.response?.data?.message || "Pin Verification Failed",
    });
  }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      logout(state) {
        state.token = null;
        state.isLoggedin = false;
        localStorage.clear();
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(loginUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
          state.isLoggedin = false;
        })
        .addCase(
          loginUser.fulfilled,
          (state, action: PayloadAction<LoginResponse>) => {
            state.isLoading = false;
            state.token = action.payload.token;
            localStorage.setItem("token", action.payload.token);
            state.isLoggedin = true
          }
        )
        .addCase(
          loginUser.rejected,
          (state, action: PayloadAction<ErrorResponse | undefined>) => {
            state.isLoading = false;
            state.isLoggedin = false;
            state.error = action.payload?.message || "Login failed";
          }
        );
    },
  });
  
  export const { logout } = authSlice.actions;
  export default authSlice.reducer;
  