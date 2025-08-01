import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API'den talepleri çekmek için thunk
export const fetchRequests = createAsyncThunk('request/fetchRequests', async (_, thunkAPI) => {
  try {
    const response = await axios.get('/api/talepler');
    // Backend'den gelen talepleri frontend'in beklediği yapıya map'le
    const mapped = response.data.map(t => ({
      requestID: t.talepNo || t.customTalepId || t.id,
      title: t.talepBasligi || t.title || "Başlıksız Talep",
      internalRequester: t.user ? { 
        name: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim(), 
        department: t.user.department 
      } : { name: t.talepSahibiAd || "Bilinmeyen" },
      status: t.durum || t.status || "Onay Bekliyor",
      createdAt: t.createdAt || t.created_at,
      ...t
    }));
    return mapped;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchRequestById = createAsyncThunk('request/fetchRequestById', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`/api/talepler/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const updateRequestStatus = createAsyncThunk('request/updateRequestStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await axios.put(`/api/talepler/${id}/status`, { status });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const updateRequestProducts = createAsyncThunk('request/updateRequestProducts', async ({ requestId, products }, thunkAPI) => {
  try {
    const response = await axios.put(`/api/talepler/${requestId}/products`, { products });
    return { requestId, products };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const initialState = {
  activeStep: 0,
  requestData: {
    title: '',
    description: '',
    externalCompanyName: '',
    externalRequesterName: ''
  },
  selectedProducts: [],
  requests: [],
  currentRequest: null,
  loading: false,
  error: null
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
    },
    updateRequestData: (state, action) => {
      const { field, value } = action.payload;
      state.requestData[field] = value;
    },
    addMultipleProductsToCart: (state, action) => {
      const newProducts = action.payload.filter(
        p_new => !state.selectedProducts.some(p_existing => p_existing.id === p_new.id)
      );
      state.selectedProducts = [...state.selectedProducts, ...newProducts];
    },
    removeProductFromCart: (state, action) => {
      state.selectedProducts = state.selectedProducts.filter(product => product.id !== action.payload);
    },
    setRequests: (state, action) => {
        state.requests = action.payload;
    },
    addRequestToList: (state, action) => {
        state.requests.push(action.payload);
    },
        resetRequestForm: (state) => {
        state.activeStep = initialState.activeStep;
        state.requestData = initialState.requestData;
        state.selectedProducts = initialState.selectedProducts;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.currentRequest = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        const t = action.payload;
        state.currentRequest = {
          ...t,
          requestID: t.talepNo || t.id,
          title: t.talepBasligi,
          description: t.aciklama,
          externalCompanyName: t.firma,
          externalRequesterName: t.talepSahibiAd,
          internalRequester: t.user ? { 
            name: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim(), 
            department: t.user.department 
          } : { name: 'Bilinmeyen' },
          products: (t.urunler || []).map(p => ({
            id: p.id,
            name: p.urunAdi,
            brand: p.marka,
            articleNumber: p.model,
            quantity: p.miktar,
            unit: p.birim
          })),
          status: t.durum
        };
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const updatedRequest = action.payload;
        const index = state.requests.findIndex(req => req.id === updatedRequest.id);
        if (index !== -1) {
          state.requests[index] = { ...state.requests[index], ...updatedRequest, status: updatedRequest.durum };
        }
        if (state.currentRequest && state.currentRequest.id === updatedRequest.id) {
          state.currentRequest.status = updatedRequest.durum;
        }
      })
      .addCase(updateRequestProducts.fulfilled, (state, action) => {
        const { requestId, products } = action.payload;
        if (state.currentRequest && state.currentRequest.id === requestId) {
          state.currentRequest.products = products;
        }
      });
  }
});

export const { 
    setActiveStep, 
    updateRequestData, 
    addMultipleProductsToCart, 
    removeProductFromCart, 
    setRequests,
    addRequestToList, 
    resetRequestForm 
} = requestSlice.actions;

export default requestSlice.reducer;
