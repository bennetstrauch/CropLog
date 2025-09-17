import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { createCategory } from "../../service/modifyService";

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");

    try {
      const newCategory = await createCategory({ name });
      if (onCategoryAdded) onCategoryAdded(newCategory);
      setName("");
    } catch (err) {
      setErrorMessage("Failed to add category.");
      console.error(err);
    }
  };

  return (
    <GenericAddForm
      buttonText="Add Category"
      primaryInput={{
        placeholder: "Category name",
        value: name,
        setValue: setName,
        validation: (value) => value.trim() !== ""
      }}
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
    />
  );
};

export default AddCategoryForm;
