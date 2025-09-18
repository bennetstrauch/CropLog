import React, { useState } from "react";

const CropList = ({ crops, measureUnits, categories, onUpdateCrop, onDeleteSelected }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const handleChange = (id, field, value) => {
    onUpdateCrop(id, field, value);
  };

  const startEditingName = (crop) => {
    // Clear any pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    setEditingCrop(crop.id);
    setEditingName(crop.name);
  };

  const saveEditingName = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }

    const originalName = crops.find(c => c.id === editingCrop)?.name;
    if (editingName.trim() && editingName.trim() !== originalName) {
      onUpdateCrop(editingCrop, "name", editingName.trim());
    }
    setEditingCrop(null);
    setEditingName("");
  };

  const cancelEditingName = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    setEditingCrop(null);
    setEditingName("");
  };

  const handleNameChange = (value) => {
    setEditingName(value);

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save after 4 seconds of no typing
    const timeout = setTimeout(() => {
      const originalName = crops.find(c => c.id === editingCrop)?.name;
      if (value.trim() && value.trim() !== originalName) {
        onUpdateCrop(editingCrop, "name", value.trim());
        // Don't exit edit mode on auto-save, keep the field active
      }
    }, 2000);

    setSaveTimeout(timeout);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditingName();
    } else if (e.key === 'Escape') {
      cancelEditingName();
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return alert("No crops selected.");
    if (window.confirm("Are you sure you want to delete the selected crops?")) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedCrops = () => {
    return [...crops].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "measureUnit":
          aValue = measureUnits.find(u => u.id === a.measureUnitId)?.name?.toLowerCase() || "";
          bValue = measureUnits.find(u => u.id === b.measureUnitId)?.name?.toLowerCase() || "";
          break;
        case "category":
          aValue = categories.find(c => c.id === a.categoryId)?.name?.toLowerCase() || "";
          bValue = categories.find(c => c.id === b.categoryId)?.name?.toLowerCase() || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Crop Management</h2>
          {crops.length > 0 && (
            <span className="text-sm text-gray-500">
              {crops.length} crop{crops.length !== 1 ? 's' : ''} total
              {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
            </span>
          )}
        </div>
      </div>

      {crops.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
            </svg>
          </div>
          <h3 className="text-gray-500 font-medium">No crops yet</h3>
          <p className="text-gray-400 text-sm">Add your first crop using the form above</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  id
                </th> */}
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Crop Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort("measureUnit")}
                >
                  <div className="flex items-center gap-1">
                    Measure Unit
                    <SortIcon field="measureUnit" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <SortIcon field="category" />
                  </div>
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-24 transition-all duration-200 ${
                    selectedIds.length > 0
                      ? 'text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50'
                      : 'text-gray-500'
                  }`}
                  onClick={selectedIds.length > 0 ? handleDelete : undefined}
                  title={selectedIds.length > 0 ? `Delete ${selectedIds.length} selected crop${selectedIds.length > 1 ? 's' : ''}` : ''}
                >
                  Select {selectedIds.length > 0 && `(${selectedIds.length})`}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedCrops().map((crop, index) => (
                <tr key={crop.id} className={`transition-colors duration-150 ${
                  selectedIds.includes(crop.id)
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : index % 2 === 0
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-yellow-50 hover:bg-yellow-100'
                }`}>
                  {/* uncimment this and th above to have id displayed */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCrop === crop.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          onKeyDown={handleNameKeyDown}
                          onBlur={saveEditingName}
                          className="text-sm font-medium border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors px-2 py-1 min-w-0 flex-1 bg-white text-gray-900"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-50"
                        onClick={() => startEditingName(crop)}
                        title="Click to edit crop name"
                      >
                        {crop.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={crop.measureUnitId ?? ""}
                      onChange={(e) =>
                        handleChange(crop.id, "measureUnitId", Number(e.target.value) || null)
                      }
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-white text-gray-900 min-w-0 w-full"
                    >
                      <option value="" className="text-gray-500">Select unit</option>
                      {measureUnits.map((unit) => (
                        <option key={unit.id} value={unit.id} className="text-gray-900">
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={crop.categoryId ?? ""}
                      onChange={(e) =>
                        handleChange(crop.id, "categoryId", Number(e.target.value) || null)
                      }
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-white text-gray-900 min-w-0 w-full"
                    >
                      <option value="" className="text-gray-500">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="text-gray-900">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(crop.id)}
                      onChange={() => toggleSelection(crop.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating delete bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 select-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {selectedIds.length} Crop{selectedIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default CropList;
