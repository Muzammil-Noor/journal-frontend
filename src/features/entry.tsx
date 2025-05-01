import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

type JournalEntry = {
    id: number
    date: Date
    content: string
}

interface EntryState {
    loading: boolean;
    error: string | null;
    success: boolean;
    entries: JournalEntry[];
}

const initialState: EntryState = {
    loading: false,
    error: null,
    success: false,
    entries: [],
};

export const createEntry = createAsyncThunk(
    'entry/create',
    async (payload: any, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) {
        return rejectWithValue('No authentication token found. Please log in again.');
        }
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/entry`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        }
        catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create entry');
        }
    }
);

export const fetchEntries= createAsyncThunk("faculty/getFaculty", async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<JournalEntry[]>(`${import.meta.env.VITE_API_BASE_URL}/api/entry`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response.data)
    }
})

const entrySlice = createSlice({
    name: 'entries',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchEntries.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchEntries.fulfilled, (state, action) => {
            state.loading = false;
            state.entries = action.payload;
        })
        .addCase(fetchEntries.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});
export default entrySlice.reducer;