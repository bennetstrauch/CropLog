import React, { useState } from "react";
import { createCategory } from "../../service/modifyService";

const AddCategory = ({ onCategoryAdded }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    try {
      const newCategory = await createCategory({ name });
      onCategoryAdded(newCategory); // inform parent
      setName("");
      setError("");
    } catch (err) {
      setError("Failed to add category.");
      console.error(err);
    }
  };

  return (
    <div className="p-3 border-b">
      <h3>Add Category</h3>
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default AddCategory;
