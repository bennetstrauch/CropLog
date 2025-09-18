import React, { useState } from "react";

const GenericEntityList = ({
  title,
  entities,
  fields,
  onUpdate,
  onDeleteSelected,
  sortable = [],
  defaultSort = null,
  emptyMessage = "No items yet",
  emptyIcon = null
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [sortField, setSortField] = useState(defaultSort || (fields.length > 0 ? fields[0].key : null));
  const [sortDirection, setSortDirection] = useState("asc");

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const startEditing = (entity, field) => {
    // Clear any pending save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    setEditingEntity(entity.id);
    setEditingField(field.key);
    setEditingValue(entity[field.key] || "");
  };

  const saveEditing = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }

    const originalValue = entities.find(e => e.id === editingEntity)?.[editingField];
    if (editingValue.trim() && editingValue.trim() !== originalValue) {
      onUpdate(editingEntity, editingField, editingValue.trim());
    }
    setEditingEntity(null);
    setEditingField(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    setEditingEntity(null);
    setEditingField(null);
    setEditingValue("");
  };

  const handleValueChange = (value) => {
    setEditingValue(value);

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save after 2 seconds of no typing
    const timeout = setTimeout(() => {
      const originalValue = entities.find(e => e.id === editingEntity)?.[editingField];
      if (value.trim() && value.trim() !== originalValue) {
        onUpdate(editingEntity, editingField, value.trim());
      }
    }, 2000);

    setSaveTimeout(timeout);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return alert("No items selected.");
    if (window.confirm(`Are you sure you want to delete the selected ${selectedIds.length} item${selectedIds.length !== 1 ? 's' : ''}?`)) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSort = (fieldKey) => {
    if (sortField === fieldKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(fieldKey);
      setSortDirection("asc");
    }
  };

  const getSortedEntities = () => {
    if (!sortField) return entities;

    return [...entities].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ fieldKey }) => {
    if (sortField !== fieldKey) {
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

  const renderField = (entity, field, index) => {
    const isEditing = editingEntity === entity?.id && editingField === field.key;

    if (field.type === 'select') {
      return (
        <select
          value={entity[field.key] ?? ""}
          onChange={(e) => onUpdate(entity?.id, field.key, Number(e.target.value) || null)}
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-white text-gray-900 min-w-0 w-full"
        >
          <option value="">{field.placeholder || "Select..."}</option>
          {field.options?.map((option) => (
            <option key={option?.id || option?.value} value={option?.id} className="text-gray-900">
              {option?.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.editable && isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editingValue}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveEditing}
            className="text-sm font-medium border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors px-2 py-1 min-w-0 flex-1 bg-white text-gray-900"
            autoFocus
          />
        </div>
      );
    }

    if (field.editable) {
      return (
        <div
          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-50"
          onClick={() => startEditing(entity, field)}
          title={`Click to edit ${field.label.toLowerCase()}`}
        >
          {entity[field.key] || "—"}
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-900">
        {entity[field.key] || "—"}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {entities.length > 0 && (
            <span className="text-sm text-gray-500">
              {entities.length} item{entities.length !== 1 ? 's' : ''} total
              {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
            </span>
          )}
        </div>
      </div>

      {entities.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-2">
            {emptyIcon || (
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
              </svg>
            )}
          </div>
          <h3 className="text-gray-500 font-medium">{emptyMessage}</h3>
          <p className="text-gray-400 text-sm">Add your first item using the form above</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {fields.map((field) => (
                  <th
                    key={field.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      sortable.includes(field.key)
                        ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none'
                        : ''
                    }`}
                    onClick={sortable.includes(field.key) ? () => handleSort(field.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {field.label}
                      {sortable.includes(field.key) && <SortIcon fieldKey={field.key} />}
                    </div>
                  </th>
                ))}
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-24 transition-all duration-200 ${
                    selectedIds.length > 0
                      ? 'text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50'
                      : 'text-gray-500'
                  }`}
                  onClick={selectedIds.length > 0 ? handleDelete : undefined}
                  title={selectedIds.length > 0 ? `Delete ${selectedIds.length} selected item${selectedIds.length > 1 ? 's' : ''}` : ''}
                >
                  Select {selectedIds.length > 0 && `(${selectedIds.length})`}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedEntities().filter(entity => entity?.id).map((entity, index) => (
                <tr key={entity.id} className={`transition-colors duration-150 ${
                  selectedIds.includes(entity.id)
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : index % 2 === 0
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-yellow-50 hover:bg-yellow-100'
                }`}>
                  {fields.map((field) => (
                    <td key={field.key} className="px-6 py-4 whitespace-nowrap">
                      {renderField(entity, field, index)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entity.id)}
                      onChange={() => toggleSelection(entity.id)}
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
            Delete {selectedIds.length} Item{selectedIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default GenericEntityList;