import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface LoginResponse {
    token: string;
}

interface pinErrorResponse {
    message: string;
}

interface AuthState {
    token: string | null;
    isLoading: boolean;
    pinError: string
    isLoggedin: boolean;
}

const initialState: AuthState = {
    token: null,
    isLoading: false,
    pinError: "",
    isLoggedin: false,
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  { pin: string },
  { rejectValue: pinErrorResponse }
>("auth/loginUser", async ({ pin }, thunkAPI) => {
  try {
    const response = await axios.post<LoginResponse>(
      `${import.meta.env.VITE_API_BASE_URL}/api/pin/verify`,
      { pin },
      { withCredentials: true }
    );
    return response.data;
  } catch (pinError: any) {
    return thunkAPI.rejectWithValue({
      message: pinError.response?.data?.message || "Pin Verification Failed",
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
        sessionStorage.clear();
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(loginUser.pending, (state) => {
          state.isLoading = true;
          state.pinError = "";
          state.isLoggedin = false;
        })
        .addCase(
          loginUser.fulfilled,
          (state, action: PayloadAction<LoginResponse>) => {
            state.isLoading = false;
            state.token = action.payload.token;
            sessionStorage.setItem("token", action.payload.token);
            state.isLoggedin = true
          }
        )
        .addCase(
          loginUser.rejected,
          (state, action: PayloadAction<pinErrorResponse | undefined>) => {
            state.isLoading = false;
            state.isLoggedin = false;
            state.pinError = action.payload?.message || "Login failed";
          }
        );
    },
  });
  
  export const { logout } = authSlice.actions;
  export default authSlice.reducer;
  