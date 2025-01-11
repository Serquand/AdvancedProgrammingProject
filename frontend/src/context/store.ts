import { configureStore } from "@reduxjs/toolkit";
import user from "./User";

export const store = configureStore({ reducer: { user } });