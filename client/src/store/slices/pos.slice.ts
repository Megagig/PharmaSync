import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product.types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface PosState {
  cart: CartItem[];
  total: number;
}

const initialState: PosState = {
  cart: [],
  total: 0,
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existingItem = state.cart.find(
        (item) => item.product.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ product: action.payload, quantity: 1 });
      }

      state.total = state.cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
    },
    processPayment(state) {
      state.cart = [];
      state.total = 0;
    },
  },
});

export const { addToCart, processPayment } = posSlice.actions;
export default posSlice.reducer;
