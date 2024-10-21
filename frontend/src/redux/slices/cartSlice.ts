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
    // Função para adicionar um item ao carrinho
    addToCart: (
      state: CartState,
      action: PayloadAction<{ id: string; name: string; price: number; image: string; quantity: number }>
    ) => {
      // Verifica se o item já existe no carrinho
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Se o item já existir, incrementa a quantidade dele
        existingItem.quantity += action.payload.quantity; 
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Função para remover um item do carrinho
    removeFromCart: (state: CartState, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Função para incrementar a quantidade de um item no carrinho
    incrementQuantity: (state: CartState, action: PayloadAction<{ id: string }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Função para decrementar a quantidade de um item no carrinho
    decrementQuantity: (state: CartState, action: PayloadAction<{ id: string }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Função para limpar o carrinho
    clearCart: (state: CartState) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
  },
});


export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
