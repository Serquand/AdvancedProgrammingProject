import { createSlice } from "@reduxjs/toolkit";
import { User } from "../utils/types";

const initialState: { user: User | null } = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser: (state, action: { payload: User | null }) => {
            state.user = action.payload;
        },
    },
});

export default userSlice.reducer;
export const { updateUser } = userSlice.actions;