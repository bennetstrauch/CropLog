import { Outlet } from "react-router-dom";
// Use the refactored service
import { get } from "../service/apiService"; 
import { createContext, useEffect, useState } from "react";

export const CropsFieldsContext = createContext();

export const CropsFieldsProvider = ({ children }) => { // Pass children through
  console.log("RENDER CropsFieldsProvider");

  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true); //# Add a loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching is more efficient!
        const [cropsData, fieldsData] = await Promise.all([
          get("crops"),      // Endpoint is /api/crops
          get("fields")      // Endpoint is /api/fields
        ]);
        
        setCrops(cropsData);
        setFields(fieldsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        // Handle error, e.g., redirect to login if unauthorized
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }
  
  // Note: The value from useRef is in '.current'
  const contextValue = { crops, fields };

  return (
    <CropsFieldsContext.Provider value={contextValue}>
      <Outlet />
    </CropsFieldsContext.Provider>
  );
};