import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice'; 

const store = configureStore({
  reducer: {
    cart: cartReducer, // Adiciona o cart reducer
  },
});

// Exporta a store para ser usada no app
export default store;

// Define os tipos RootState e AppDispatch com base na configuração da store
export type RootState = ReturnType<typeof store.getState>; // Tipo que representa todo o state da store
export type AppDispatch = typeof store.dispatch; // Tipo para o dispatch da store
