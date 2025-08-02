import { Outlet } from "react-router-dom";
// Use the refactored service
import { get, getLatestHarvestRecord } from "../service/apiService";
import { createContext, useContext, useEffect, useState } from "react";

export const CropsFieldsContext = createContext();

export const CropsFieldsProvider = ({ children }) => {
  // Pass children through
  console.log("RENDER CropsFieldsProvider");

  const [loading, setLoading] = useState(true); //# Add a loading state

  // const [latestEntry, setLatestEntry] = useState(null);
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);

  // const fetchLatestEntry = async () => {
  //   try {
  //     const latest = await getLatestHarvestRecord();
  //     setLatestEntry(latest);
  //   } catch (error) {
  //     if (error.response?.status === 404) {
  //       console.warn("No latest entry found.");
  //       setLatestEntry(null);
  //     } else {
  //       console.error("Error fetching latest entry:", error);
  //     }
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching is more efficient!
        const [cropsData, fieldsData] = await Promise.all([
          get("crops"), // Endpoint is /api/crops
          get("fields"), // Endpoint is /api/fields
        ]);

        setCrops(cropsData);
        setFields(fieldsData);

        // await fetchLatestEntry();
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

  const contextValue = { crops, fields};

  return (
    <CropsFieldsContext.Provider value={contextValue}>
      <Outlet />
    </CropsFieldsContext.Provider>
  );
};

export const ProvideCropsAndFieldsContext = () =>
  useContext(CropsFieldsContext);

