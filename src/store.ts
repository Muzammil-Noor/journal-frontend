import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth";
import entryReducer from "@/features/entry";

const store = configureStore({
    reducer: {
        auth: authReducer,
        entry: entryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;