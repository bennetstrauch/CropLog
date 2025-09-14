import React from "react";
import { useCategories } from "../../context/CategoriesProvider";
import AddCategory from "./AddCategory";
import CategoryList from "./CategoryList";

const CategoryModPage = () => {
  const { categories, setCategories } = useCategories();

  const handleCategoryAdded = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
  };

  return (
    <div>
      <AddCategory onCategoryAdded={handleCategoryAdded} />
      <CategoryList categories={categories} />
    </div>
  );
};

export default CategoryModPage;
