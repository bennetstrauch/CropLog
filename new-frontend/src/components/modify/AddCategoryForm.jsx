import React, { useState } from "react";
import GenericAddForm from "./GenericAddForm";
import { createCategories } from "../../service/modifyService";
import { useNotification } from "../../context/NotificationContext";

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [categoriesInput, setCategoriesInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    setErrorMessage("");
    const categoryNames = categoriesInput.split(",").map((c) => c.trim()).filter(name => name !== "");
    if (categoryNames.length === 0) {
      setErrorMessage("Please enter at least one category name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryRequests = categoryNames.map(name => ({ name }));
      const newCategories = await createCategories(categoryRequests);
      if (onCategoryAdded) newCategories.forEach(category => onCategoryAdded(category));
      showNotification("Category added!");
      setCategoriesInput("");
    } catch (err) {
      setErrorMessage("Failed to add categories.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
      isLoading={isSubmitting}
      errorMessage={errorMessage}
    />
  );
};

export default AddCategoryForm;
