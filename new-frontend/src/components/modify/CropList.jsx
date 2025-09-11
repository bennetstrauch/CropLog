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
              {/* --- Measure Unit Select --- */}
              <td>
                <select
                  value={crop.measureUnitId ?? ""}
                  onChange={(e) =>
                    handleChange(crop.id, "measureUnitId", Number(e.target.value) || null)
                  }
                >
                  <option value="">-- Select Measure Unit --</option>
                  {measureUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </td>

              {/* --- Category Select --- */}
              <td>
                <select
                  value={crop.categoryId ?? ""}
                  onChange={(e) =>
                    handleChange(crop.id, "categoryId", Number(e.target.value) || null)
                  }
                >
                  <option value="">-- No Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
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
