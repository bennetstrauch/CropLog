
import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { createFields } from "../../service/modifyService";

const AddFieldForm = ({ onFieldAdded }) => {
  const [fieldsInput, setFieldsInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");

    try {
      const fieldNames = fieldsInput.split(",").map((f) => f.trim()).filter(name => name !== "");
      if (fieldNames.length === 0) {
        setErrorMessage("Please enter at least one field name.");
        return;
      }

      const fieldRequests = fieldNames.map(name => ({ name }));
      const newFields = await createFields(fieldRequests);

      // Add all new fields to the context
      if (onFieldAdded) {
        newFields.forEach(field => onFieldAdded(field));
      }

      setFieldsInput("");
    } catch (err) {
      setErrorMessage("Failed to add fields.");
      console.error(err);
    }
  };

  return (
    <GenericAddForm
      buttonText="Add Fields"
      primaryInput={{
        placeholder: "e.g. Field A, Field B",
        helperText: "names separated by comma",
        value: fieldsInput,
        setValue: setFieldsInput,
        validation: (value) => value.trim() !== ""
      }}
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
    />
  );
};

export default AddFieldForm;
