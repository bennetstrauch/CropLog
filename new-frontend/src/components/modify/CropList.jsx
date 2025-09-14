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
            <th
              style={{
                cursor: selectedIds.length > 0 ? 'pointer' : 'default',
                color: selectedIds.length > 0 ? '#dc2626' : 'inherit',
                fontWeight: selectedIds.length > 0 ? 'bold' : 'normal'
              }}
              onClick={selectedIds.length > 0 ? handleDelete : undefined}
              title={selectedIds.length > 0 ? `Delete ${selectedIds.length} selected crop${selectedIds.length > 1 ? 's' : ''}` : ''}
            >
              Delete {selectedIds.length > 0 && `(${selectedIds.length})`}
            </th>
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

      {/* Floating delete bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          onClick={handleDelete}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#b91c1c';
            e.target.style.transform = 'translateX(-50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#dc2626';
            e.target.style.transform = 'translateX(-50%) scale(1)';
          }}
        >
          🗑️ Delete {selectedIds.length} Selected Crop{selectedIds.length > 1 ? 's' : ''}
        </div>
      )}
    </section>
  );
};

export default CropList;
