import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import ordersReducer from "./slices/ordersSlice";
import staffReducer from "./slices/staffSlice";
import expensesReducer from "./slices/expensesSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    staff: staffReducer,
    expenses: expensesReducer,
  },
});