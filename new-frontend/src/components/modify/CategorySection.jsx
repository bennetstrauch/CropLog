import React from "react";
import AddCategoryForm from "./AddCategoryForm";
import CategoryList from "./CategoryList";
import { useCategories } from "../../context/CategoriesProvider";

const CategorySection = () => {
  const { categories, setCategories } = useCategories();

  const handleCategoryAdded = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
  };

  return (
    <div>
      <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
      <CategoryList categories={categories} />
    </div>
  );
};

export default CategorySection;