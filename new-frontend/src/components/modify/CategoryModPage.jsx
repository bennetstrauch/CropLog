import React, { useEffect, useState } from "react";
import { getCategories } from "../../service/modifyService";
import AddCategory from "./AddCategory";
import CategoryList from "./CategoryList";

const CategoryModPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

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
