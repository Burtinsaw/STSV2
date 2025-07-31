// src/store/reducer.js

import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import requestReducer from './requestSlice'; 

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  request: requestReducer 
});

export default reducer;