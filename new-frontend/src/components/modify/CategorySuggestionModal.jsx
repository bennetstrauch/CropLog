import React, { useState } from "react";
import { createCategories, updateCrop } from "../../service/modifyService";

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: "12px",
    padding: "24px",
    width: "90%",
    maxWidth: "600px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  cropItem: {
    marginBottom: "16px",
    borderBottom: "1px solid #ccc",
    paddingBottom: "8px",
  },
  select: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginTop: "4px",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginTop: "4px",
  },
  error: {
    color: "red",
    fontSize: "0.9em",
    marginTop: "8px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "16px",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
};

const CategorySuggestionModal = ({ crops, categories, onClose, onCropsUpdated }) => {
  const [cropSelections, setCropSelections] = useState(() =>
    Object.fromEntries(
      crops.map((crop) => [
        crop.id,
        {
          type: crop.categorySuggestion ? "suggested" : "existing",
          value: crop.categorySuggestion || "",
        },
      ])
    )
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDropdownChange = (cropId, value) => {
    if (value === "new") {
      setCropSelections((prev) => ({
        ...prev,
        [cropId]: { type: "new", value: "" },
      }));
    } else if (value.startsWith("existing:")) {
      setCropSelections((prev) => ({
        ...prev,
        [cropId]: { type: "existing", value: value.replace("existing:", "") },
      }));
    } else if (value.startsWith("suggested:")) {
      setCropSelections((prev) => ({
        ...prev,
        [cropId]: { type: "suggested", value: value.replace("suggested:", "") },
      }));
    }
  };

  const handleNewCategoryInput = (cropId, value) => {
    setCropSelections((prev) => ({
      ...prev,
      [cropId]: { ...prev[cropId], value },
    }));
  };

  const handleSave = async () => {
    setError("");

    const hasEmpty = Object.values(cropSelections).some(
      (sel) => sel.type === "new" && !sel.value.trim()
    );
    if (hasEmpty) {
      setError("Please fill all new category names before saving.");
      return;
    }

    setSaving(true);
    try {
      // Create new categories (including suggested ones that user wants to save)
      // First, get unique category names that need to be created
      const categoryNamesToCreate = [
        ...new Set(
          Object.values(cropSelections)
            .filter((sel) => sel.type === "new" || sel.type === "suggested")
            .map((sel) => sel.value.trim())
            .filter((name) => name) // Remove empty strings
        ),
      ];

      // Filter out categories that already exist
      const existingCategoryNames = new Set(categories.map(c => c.name.toUpperCase()));
      const newCategoryNames = categoryNamesToCreate
        .filter(name => !existingCategoryNames.has(name.toUpperCase()))
        .map(name => ({ name }));

      let newCategories = [];
      console.log("Categories to create (filtered):", newCategoryNames);
      if (newCategoryNames.length > 0) {
        newCategories = await createCategories(newCategoryNames);
      }

      // Create combined mapping of all categories (existing + newly created)
      const allCategoriesMap = new Map();

      // Add existing categories
      categories.forEach(cat => {
        allCategoriesMap.set(cat.name.toUpperCase(), cat.id);
      });

      // Add newly created categories
      newCategories.forEach(cat => {
        allCategoriesMap.set(cat.name.toUpperCase(), cat.id);
      });

      console.log("All categories mapping:", Object.fromEntries(allCategoriesMap));

      // Build update payload
      const updates = crops.map((crop) => {
        const sel = cropSelections[crop.id];
        let categoryId = null;

        console.log(`Crop ${crop.name}: sel.type=${sel.type}, sel.value="${sel.value}"`);

        if (sel.type === "existing") {
          categoryId = parseInt(sel.value, 10);
        } else if (sel.type === "suggested" || sel.type === "new") {
          const categoryName = sel.value.trim().toUpperCase();
          categoryId = allCategoriesMap.get(categoryName);
          console.log(`Looking up "${categoryName}" in allCategories, found: ${categoryId}`);
        }

        return { id: crop.id, categoryId };
      });

      console.log("Updates to send:", updates);

      await Promise.all(updates.map((u) => updateCrop(u.id, { categoryId: u.categoryId })));

      onCropsUpdated();
      onClose();
    } catch (err) {
      console.error("Category save error:", err);
      if (err.message?.includes('duplicate key') || err.response?.status === 500) {
        setError("Some categories already exist. Please try again or use different names.");
      } else {
        setError("Failed to save categories and update crops. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={{ marginBottom: "16px" }}>Review Suggested Categories</h2>

        {crops.map((crop) => {
          const sel = cropSelections[crop.id];
          return (
            <div key={crop.id} style={modalStyles.cropItem}>
              <div>{crop.name}</div>
              <select
                style={modalStyles.select}
                value={
                  sel.type === "new"
                    ? "new"
                    : sel.type === "existing"
                    ? `existing:${sel.value}`
                    : `suggested:${sel.value}`
                }
                onChange={(e) => handleDropdownChange(crop.id, e.target.value)}
              >
                {crop.categorySuggestion && (
                  <option value={`suggested:${crop.categorySuggestion}`}>
                    {crop.categorySuggestion} (Suggested)
                  </option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={`existing:${cat.id}`}>
                    {cat.name}
                  </option>
                ))}
                <option value="new">+ Create New Category</option>
              </select>

              {sel.type === "new" && (
                <input
                  type="text"
                  style={modalStyles.input}
                  placeholder="Enter new category name"
                  value={sel.value}
                  onChange={(e) => handleNewCategoryInput(crop.id, e.target.value)}
                />
              )}
            </div>
          );
        })}

        {error && <div style={modalStyles.error}>{error}</div>}

        <div style={modalStyles.footer}>
          <button
            style={{ ...modalStyles.button, ...modalStyles.cancelButton }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            style={{ ...modalStyles.button, ...modalStyles.saveButton }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySuggestionModal;
