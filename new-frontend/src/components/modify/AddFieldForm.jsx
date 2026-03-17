
import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { createFields } from "../../service/modifyService";
import { useNotification } from "../../context/NotificationContext";

const AddFieldForm = ({ onFieldAdded }) => {
  const [fieldsInput, setFieldsInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    setErrorMessage("");
    const fieldNames = fieldsInput.split(",").map((f) => f.trim()).filter(name => name !== "");
    if (fieldNames.length === 0) {
      setErrorMessage("Please enter at least one field name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fieldRequests = fieldNames.map(name => ({ name }));
      const newFields = await createFields(fieldRequests);
      if (onFieldAdded) newFields.forEach(field => onFieldAdded(field));
      showNotification("Field added!");
      setFieldsInput("");
    } catch (err) {
      setErrorMessage("Failed to add fields.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
      isLoading={isSubmitting}
      errorMessage={errorMessage}
    />
  );
};

export default AddFieldForm;
