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
      // Create new categories
      const newCategoryNames = [
        ...new Set(
          Object.values(cropSelections)
            .filter((sel) => sel.type === "new")
            .map((sel) => ({ name: sel.value.trim() }))
        ),
      ];

      let newCategories = [];
      if (newCategoryNames.length > 0) {
        newCategories = await createCategories(newCategoryNames);
      }

      const nameToId = Object.fromEntries(newCategories.map((c) => [c.name, c.id]));

      // Build update payload
      const updates = crops.map((crop) => {
        const sel = cropSelections[crop.id];
        let categoryId = null;

        if (sel.type === "existing") {
          categoryId = parseInt(sel.value, 10);
        } else if (sel.type === "suggested" || sel.type === "new") {
          categoryId = nameToId[sel.value];
        }

        return { id: crop.id, categoryId };
      });

      await Promise.all(updates.map((u) => updateCrop(u.id, { categoryId: u.categoryId })));

      onCropsUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
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
