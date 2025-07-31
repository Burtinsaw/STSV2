import { createSlice } from '@reduxjs/toolkit';

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
    addRequestToList: (state, action) => {
        state.requests.push(action.payload);
    },
    // YENİ EYLEM: Bir talebin statüsünü günceller
    updateRequestStatus: (state, action) => {
        const { requestId, newStatus } = action.payload;
        const requestIndex = state.requests.findIndex(req => req.requestID === requestId);
        if (requestIndex !== -1) {
            state.requests[requestIndex].status = newStatus;
        }
    },
    resetRequestForm: (state) => {
        state.activeStep = initialState.activeStep;
        state.requestData = initialState.requestData;
        state.selectedProducts = initialState.selectedProducts;
    },
  }
});

export const { 
    setActiveStep, 
    updateRequestData, 
    addMultipleProductsToCart, 
    removeProductFromCart, 
    addRequestToList, 
    updateRequestStatus, // Yeni eylemi dışa aktar
    resetRequestForm 
} = requestSlice.actions;

export default requestSlice.reducer;
