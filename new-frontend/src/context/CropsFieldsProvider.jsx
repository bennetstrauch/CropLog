import { Outlet } from "react-router-dom";
// Use the refactored service
import { get, getLatestHarvestRecord } from "../service/apiService";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCrops, getFields, getMeasureUnits } from "../service/modifyService";

export const CropsFieldsContext = createContext();

export const CropsFieldsProvider = ({ children }) => {
  // Pass children through
  console.log("RENDER CropsFieldsProvider");

  const [loading, setLoading] = useState(true); //# Add a loading state

  // const [latestEntry, setLatestEntry] = useState(null);
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);


  const cropsMap = useMemo(
    () => Object.fromEntries(crops.map((c) => [c.id, c])),
    [crops]
  );
  const fieldsMap = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.id, f])),
    [fields]
  );

  const measureUnitsMap = useMemo(
    () => Object.fromEntries(measureUnits.map((m) => [m.id, m])),
    [measureUnits]
  )

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

  // ## field and crop ids are fetched, how to map from this to the actual names / objects for the harvest log?

  useEffect(() => {
    console.log("Fetching initial data.")

    const fetchData = async () => {
      try {
        // Parallel fetching is more efficient!
        const [cropsData, fieldsData, measureUnitsData] = await Promise.all([
          getCrops(),
          getFields(),
          getMeasureUnits()
        ]);

        setCrops(cropsData);
        setFields(fieldsData);
        setMeasureUnits(measureUnitsData)
          console.log("fetched measureUnits: ", measureUnits)
          console.log("fetched crops: ", cropsData)


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

  const contextValue = { crops, fields, cropsMap, fieldsMap, measureUnits, setCrops, setMeasureUnits, measureUnitsMap };

  return (
    <CropsFieldsContext.Provider value={contextValue}>
      <Outlet />
    </CropsFieldsContext.Provider>
  );
};

export const ProvideCropsAndFieldsContext = () =>
  useContext(CropsFieldsContext);
