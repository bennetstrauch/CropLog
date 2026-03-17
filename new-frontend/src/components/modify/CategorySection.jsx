import React from "react";
import AddCategoryForm from "./AddCategoryForm";
import GenericEntityList from "./GenericEntityList";
import { useCategories } from "../../context/CategoriesProvider";
import { updateCategory, deleteCategories, hardDeleteCategories, updateCategoriesActiveBatch } from "../../service/modifyService";
import { useNotification } from "../../context/NotificationContext";

const CategorySection = () => {
  const { categories, setCategories, loading } = useCategories();
  const { showNotification } = useNotification();

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
        active: field === "active" ? value : currentCategory.active,
      };

      const updatedCategory = await updateCategory(id, updateData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updatedCategory : c))
      );
    } catch (error) {
      console.error("Failed to update category:", error);
      showNotification("Failed to update category.", "error");
    }
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await deleteCategories(ids);
      setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
      showNotification("Marked as inactive.");
    } catch (error) {
      console.error("Failed to delete categories:", error);
      showNotification("Failed to delete categories.", "error");
    }
  };

  const handleHardDelete = async (ids, cascade = false) => {
    await hardDeleteCategories(ids, cascade);
    setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
    showNotification("Permanently deleted.");
  };

  const handleBatchToggleActive = async (ids, active) => {
    try {
      await updateCategoriesActiveBatch(ids, active);
      setCategories((prev) => prev.map(c => ids.includes(c.id) ? { ...c, active } : c));
      showNotification(active ? "Marked as active." : "Marked as inactive.");
    } catch (error) {
      console.error("Failed to update active status:", error);
      showNotification("Failed to update active status.", "error");
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
        onHardDeleteSelected={handleHardDelete}
        onBatchToggleActive={handleBatchToggleActive}
        entityName="Category"
        sortable={['name']}
        defaultSort="name"
        emptyMessage="No categories yet"
        showActiveColumn={true}
        loading={loading}
      />
    </div>
  );
};

export default CategorySection;
