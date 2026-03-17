import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { createMeasureUnit } from "../../service/modifyService";
import { useNotification } from "../../context/NotificationContext";

const AddMeasureUnitForm = ({ onAdded }) => {
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const unitToPost = { name: name.trim(), abbreviation: abbreviation.trim() };
      const newUnit = await createMeasureUnit(unitToPost);
      if (onAdded) onAdded(newUnit);
      showNotification("Measure unit added!");
      setName("");
      setAbbreviation("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add measure unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericAddForm
      buttonText="Add Unit"
      primaryInput={{
        placeholder: "Name",
        value: name,
        setValue: setName,
        validation: (value) => value.trim() !== ""
      }}
      additionalInputs={[
        {
          placeholder: "Abbreviation (optional)",
          value: abbreviation,
          setValue: setAbbreviation,
          required: false,
          validation: () => true
        }
      ]}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      errorMessage={errorMessage}
    />
  );
};

export default AddMeasureUnitForm;
