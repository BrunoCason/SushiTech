import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'), // Carrega os itens do localStorage
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state: CartState,
      action: PayloadAction<{ id: string; name: string; price: number; image: string }>
    ) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1; // Incrementa a quantidade se o item já estiver na sacola
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items)); // Salva no localStorage
    },
    removeFromCart: (state: CartState, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);
      localStorage.setItem('cartItems', JSON.stringify(state.items)); // Atualiza o localStorage
    },
    incrementQuantity: (state: CartState, action: PayloadAction<{ id: string }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1; // Incrementa a quantidade
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items)); // Atualiza o localStorage
    },
    decrementQuantity: (state: CartState, action: PayloadAction<{ id: string }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1; // Decrementa a quantidade
      } else {
        state.items = state.items.filter(item => item.id !== action.payload.id); // Remove o item se a quantidade for 0
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items)); // Atualiza o localStorage
    },
    clearCart: (state: CartState) => {
      state.items = [];
      localStorage.removeItem('cartItems'); // Remove os itens do localStorage
    },
  },
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
