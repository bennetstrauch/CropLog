import { CropsFieldsContext } from "../../context/CropsFieldsProvider";
import "./fieldButton.css";
import { useContext, useState } from "react";

function FieldButton({ id, name }) {
  const { harvestedFields } = useContext(CropsFieldsContext);
  const [isSelected, setSelected] = useState(false);

  const addToSelectedFields = () => {
    harvestedFields.current.push(id);
  };

  const removeFromSelectedFields = () =>
    (harvestedFields.current = harvestedFields.current.filter(
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
