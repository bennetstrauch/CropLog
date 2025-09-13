// useHarvestForm.ts (custom hook)
import { useRef, useState } from "react";
import { getCurrentDate } from "../../service/utils";

export default function useHarvestForm() {
  const [harvestDate, setHarvestDate] = useState(getCurrentDate());
  const [selectedCrop, setSelectedCrop] = useState("");
  const [harvestedAmount, setHarvestedAmount] = useState(0);
  // const [harvestedFields, setHarvestedFields] = useState([]);
  const harvestedFieldsRef = useRef([]);

  const resetForm = () => {
    setHarvestDate(getCurrentDate());
    setSelectedCrop("");
    setHarvestedAmount(0);
    harvestedFieldsRef.current = [];
  };

  const resetHarvestDate = () => setHarvestDate(getCurrentDate());
  const resetCropSelection = () => setSelectedCrop("");
  const resetHarvestedAmount = () => setHarvestedAmount(0);
  const resetHarvestedFields = () => {
    harvestedFieldsRef.current = [];
  };

  const setHarvestedFields = (fields) => {
    harvestedFieldsRef.current = fields;
  };

  return {
    harvestDate,
    setHarvestDate,
    selectedCrop,
    setSelectedCrop,
    harvestedAmount,
    setHarvestedAmount,
    harvestedFieldsRef,
    setHarvestedFields,
    resetForm,
    resetHarvestDate,
    resetCropSelection,
    resetHarvestedAmount,
    resetHarvestedFields,
  };
}
