import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

type JournalEntry = {
    id: number
    date: Date
    content: string
    title: string
}

enum TitleStyle {
  AUTO_NUMBER = "AUTO_NUMBER",
  CUSTOM_TITLE = "CUSTOM_TITLE",
  CUSTOM_AND_AUTO = "CUSTOM_AND_AUTO",
}

interface Category {
  id: number
  name: string
  icon: string
  titleStyle: TitleStyle
  recordDateTime: boolean
}

interface EntryState {
    loading: boolean;
    error: string | null;
    success: boolean;
    entries: JournalEntry[];
    categories: Category[]
}

const initialState: EntryState = {
    loading: false,
    error: null,
    success: false,
    entries: [],
    categories: []
};

export const createEntry = createAsyncThunk(
    'entry/create',
    async (payload: any, { rejectWithValue }) => {
        const token = sessionStorage.getItem('token');
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

export const fetchEntries = createAsyncThunk("entry/get", async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axios.get<JournalEntry[]>(`${import.meta.env.VITE_API_BASE_URL}/api/entry/${payload.category}`, {
        headers: { Authorization: `Bearer ${payload.token}` },
      })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response.data)
    }
})

export const createCategory = createAsyncThunk(
    'category/create',
    async (payload: any, { rejectWithValue }) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
        return rejectWithValue('No authentication token found. Please log in again.');
        }
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/category`,
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
            return rejectWithValue(err.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'category/update',
    async (payload: any, { rejectWithValue }) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
        return rejectWithValue('No authentication token found. Please log in again.');
        }
    
        try {
            console.log(payload)
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/category/${payload.id}`,
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
            return rejectWithValue(err.response?.data?.message || 'Failed to create category');
        }
    }
);

export const deleteCategory = createAsyncThunk("category/get", async (payload: any, { rejectWithValue }) => {
    try {
        const token = payload.token
        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/category/${payload.categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response.data)
    }
})

export const fetchCategories = createAsyncThunk("category/get", async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<Category[]>(`${import.meta.env.VITE_API_BASE_URL}/api/category`, {
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
        })
        .addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.categories = action.payload;
        })
        .addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});
export default entrySlice.reducer;