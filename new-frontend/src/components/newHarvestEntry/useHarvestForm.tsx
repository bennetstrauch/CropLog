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

  console.log("useHarvestForm - harvestedFields:", harvestedFieldsRef);
  return {
    harvestDate,
    setHarvestDate,
    selectedCrop,
    setSelectedCrop,
    harvestedAmount,
    setHarvestedAmount,
    harvestedFieldsRef,
    resetForm,
  };
}
