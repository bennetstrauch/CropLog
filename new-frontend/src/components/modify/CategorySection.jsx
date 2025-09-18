import React from "react";
import AddCategoryForm from "./AddCategoryForm";
import GenericEntityList from "./GenericEntityList";
import { useCategories } from "../../context/CategoriesProvider";
import { updateCategory, deleteCategories } from "../../service/modifyService";

const CategorySection = () => {
  const { categories, setCategories } = useCategories();

  const handleCategoryAdded = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const currentCategory = categories.find(c => c.id === id);
      if (!currentCategory) {
        throw new Error("Category not found");
      }

      const updateData = {
        name: field === "name" ? value : currentCategory.name,
      };

      const updatedCategory = await updateCategory(id, updateData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updatedCategory : c))
      );
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category.");
    }
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await deleteCategories(ids);
      setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
    } catch (error) {
      console.error("Failed to delete categories:", error);
      alert("Failed to delete categories.");
    }
  };

  const fieldConfig = [
    {
      key: 'name',
      label: 'Category Name',
      type: 'text',
      editable: true,
      required: true
    }
  ];

  return (
    <div>
      <AddCategoryForm onCategoryAdded={handleCategoryAdded} />

      <GenericEntityList
        title="Category Management"
        entities={categories}
        fields={fieldConfig}
        onUpdate={handleUpdate}
        onDeleteSelected={handleDeleteSelected}
        sortable={['name']}
        defaultSort="name"
        emptyMessage="No categories yet"
      />
    </div>
  );
};

export default CategorySection;