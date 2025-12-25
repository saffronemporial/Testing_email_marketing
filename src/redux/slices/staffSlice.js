import { createSlice } from "@reduxjs/toolkit";

const staffSlice = createSlice({
  name: "staff",
  initialState: [],
  reducers: {
    addStaff: (state, action) => { state.push(action.payload); },
  },
});

export const { addStaff } = staffSlice.actions;
export default staffSlice.reducer;
