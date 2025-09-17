
import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { addGenericValues } from "../../service/modifyService";
import { formatValueListForDatabase } from "../../service/utils";

const AddFieldForm = ({ onAdded }) => {
  const [fieldsInput, setFieldsInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");
    const fields = formatValueListForDatabase(fieldsInput);

    try {
      await addGenericValues(fields, "fields");
      setFieldsInput("");
      if (onAdded) onAdded();
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
