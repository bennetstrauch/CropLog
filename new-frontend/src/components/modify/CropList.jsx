import React, { useState } from "react";

const CropList = ({ crops, measureUnits, categories, onUpdateCrop, onDeleteSelected }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const handleChange = (id, field, value) => {
    onUpdateCrop(id, field, value); // optimistic update
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return alert("No crops selected.");
    if (window.confirm("Are you sure you want to delete the selected crops?")) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <section>
      <h2>Crops</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Measure Unit</th>
            <th>Category</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {crops.map((crop, index) => (
            <tr key={crop.id}>
              <td>{index + 1}</td>
              <td>{crop.name}</td>
              <td>
                <select
                  value={crop.measureUnit}
                  onChange={(e) =>
                    handleChange(crop.id, "measureUnit", e.target.value)
                  }
                >
                  {measureUnits.map((unit) => (
                    <option key={unit.id} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                  <option value="">+ Add New...</option>
                </select>
              </td>
              <td>
                <select
                  value={crop.category || ""}
                  onChange={(e) =>
                    handleChange(crop.id, "category", e.target.value)
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="">+ Add New...</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(crop.id)}
                  onChange={() => toggleSelection(crop.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleDelete}>Delete Selected Crops</button>
    </section>
  );
};

export default CropList;
