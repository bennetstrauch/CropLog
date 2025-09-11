import React, { useState } from "react";
import { createCategories, updateCrop } from "../../service/modifyService";

const CategorySuggestionModal = ({ crops, categories, onClose, onCropsUpdated }) => {
  const [cropSelections, setCropSelections] = useState(() =>
    Object.fromEntries(
      crops.map(crop => [
        crop.id,
        {
          type: crop.categorySuggestion ? "suggested" : "existing",
          value: crop.categorySuggestion || "" // empty string if no suggestion
        }
      ])
    )
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDropdownChange = (cropId, value) => {
    if (value === "new") {
      setCropSelections(prev => ({
        ...prev,
        [cropId]: { type: "new", value: "" }
      }));
    } else if (value.startsWith("existing:")) {
      setCropSelections(prev => ({
        ...prev,
        [cropId]: { type: "existing", value: value.replace("existing:", "") }
      }));
    } else if (value.startsWith("suggested:")) {
      setCropSelections(prev => ({
        ...prev,
        [cropId]: { type: "suggested", value: value.replace("suggested:", "") }
      }));
    }
  };

  const handleNewCategoryInput = (cropId, value) => {
    setCropSelections(prev => ({
      ...prev,
      [cropId]: { ...prev[cropId], value }
    }));
  };

  const handleSave = async () => {
    setError("");

    // Validation
    const hasEmpty = Object.values(cropSelections).some(
      sel => sel.type === "new" && !sel.value.trim()
    );
    if (hasEmpty) {
      setError("Please fill all new category names before saving.");
      return;
    }

    setSaving(true);
    try {
      // 1. Create any new categories
      const newCategoryNames = [
        ...new Set(
          Object.values(cropSelections)
            .filter(sel => sel.type === "new")
            .map(sel => ({ name: sel.value.trim() }))
        )
      ];

      let newCategories = [];
      if (newCategoryNames.length > 0) {
        newCategories = await createCategories(newCategoryNames);
      }

      const nameToId = Object.fromEntries(newCategories.map(c => [c.name, c.id]));

      // 2. Build update payload
      const updates = crops.map(crop => {
        const sel = cropSelections[crop.id];
        let categoryId = null;

        if (sel.type === "existing") {
          categoryId = parseInt(sel.value, 10);
        } else if (sel.type === "suggested" || sel.type === "new") {
          categoryId = nameToId[sel.value];
        }

        return { id: crop.id, categoryId };
      });

      // 3. Send updates (could be batch endpoint)
      await Promise.all(updates.map(u => updateCrop(u.id, { categoryId: u.categoryId })));

      onCropsUpdated(); // Refresh crop list in parent
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          Review Suggested Categories
        </h2>

        {crops.map(crop => {
          const sel = cropSelections[crop.id];
          return (
            <div key={crop.id} className="mb-4 border-b pb-2">
              <div className="font-medium">{crop.name}</div>
              <select
                className="mt-1 w-full border rounded p-2"
                value={
                  sel.type === "new"
                    ? "new"
                    : sel.type === "existing"
                    ? `existing:${sel.value}`
                    : `suggested:${sel.value}`
                }
                onChange={e => handleDropdownChange(crop.id, e.target.value)}
              >
                {crop.categorySuggestion && (
                  <option value={`suggested:${crop.categorySuggestion}`}>
                    {crop.categorySuggestion} (Suggested)
                  </option>
                )}
                {categories.map(cat => (
                  <option key={cat.id} value={`existing:${cat.id}`}>
                    {cat.name}
                  </option>
                ))}
                <option value="new">+ Create New Category</option>
              </select>

              {sel.type === "new" && (
                <input
                  type="text"
                  className="mt-2 w-full border rounded p-2"
                  placeholder="Enter new category name"
                  value={sel.value}
                  onChange={e => handleNewCategoryInput(crop.id, e.target.value)}
                />
              )}
            </div>
          );
        })}

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
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
