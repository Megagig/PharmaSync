import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Product {
    _id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    category?: {
        _id: string;
        name: string;
    };
    images?: string[];
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    isLoading: false,
    error: null,
};

interface FetchProductsParams {
    search?: string;
    category?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
}

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params: FetchProductsParams = {}) => {
        const response = await api.get('/products', { params });
        return response.data.data;
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch products';
            })
            .addCase(fetchProductById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch product';
            });
    },
});

export const { setSelectedProduct, clearSelectedProduct } = productSlice.actions;

export default productSlice.reducer; 