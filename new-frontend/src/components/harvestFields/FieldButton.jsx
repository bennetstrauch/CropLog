import { ProvideCropsAndFieldsContext } from "../../context/CropsFieldsProvider";
import "./fieldButton.css";
import { useState } from "react";

function FieldButton({ id, name, harvestedFieldsRef }) {
  console.log("RENDER FieldButton, harvestedFields:", harvestedFieldsRef.current);
  const [isSelected, setSelected] = useState(false);

  const addToSelectedFields = () => {
    harvestedFieldsRef.current.push(id);
  };

  const removeFromSelectedFields = () =>
    (harvestedFieldsRef.current = harvestedFieldsRef.current.filter(
      (fieldId) => fieldId != id
    ));

  const toggleSelection = () => {
    setSelected(!isSelected);
    if (!isSelected) {
      addToSelectedFields();
    } else {
      removeFromSelectedFields();
    }
  };

  return (
    <button
      onClick={toggleSelection}
      className={isSelected ? "highlightAsSelected" : "noChange"}
    >
      {name}
    </button>
  );
}

export default FieldButton;
