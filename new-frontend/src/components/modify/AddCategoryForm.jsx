import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { createCategories } from "../../service/modifyService";

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [categoriesInput, setCategoriesInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");

    try {
      const categoryNames = categoriesInput.split(",").map((c) => c.trim()).filter(name => name !== "");
      if (categoryNames.length === 0) {
        setErrorMessage("Please enter at least one category name.");
        return;
      }

      const categoryRequests = categoryNames.map(name => ({ name }));
      const newCategories = await createCategories(categoryRequests);

      // Add all new categories to the context
      if (onCategoryAdded) {
        newCategories.forEach(category => onCategoryAdded(category));
      }

      setCategoriesInput("");
    } catch (err) {
      setErrorMessage("Failed to add categories.");
      console.error(err);
    }
  };

  return (
    <GenericAddForm
      buttonText="Add Categories"
      primaryInput={{
        placeholder: "Category 1, Category 2, Category 3",
        helperText: "names separated by comma",
        value: categoriesInput,
        setValue: setCategoriesInput,
        validation: (value) => value.trim() !== ""
      }}
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
    />
  );
};

export default AddCategoryForm;
