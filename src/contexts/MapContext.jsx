import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the map context
const initialState = {
  // Define your initial state properties here
};

// Reducer function to handle state updates
const mapReducer = (state, action) => {
  switch (action.type) {
    // Define your action types and state updates here
    default:
      return state;
  }
};

// Create the map context
const MapContext = createContext();

// Custom hook to use the map context
const useMapContext = () => {
  return useContext(MapContext);
};

// Map context provider component
const MapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  return (
    <MapContext.Provider value={{ state, dispatch }}>
      {children}
    </MapContext.Provider>
  );
};

export { MapProvider, useMapContext };