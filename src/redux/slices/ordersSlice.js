import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
  name: "orders",
  initialState: [],
  reducers: {
    addOrders: (state, action) => { state.push(action.payload); },
  },
});

export const { addOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
