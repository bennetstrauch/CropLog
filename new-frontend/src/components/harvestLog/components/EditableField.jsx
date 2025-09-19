// components/EditableField.jsx - Reusable editable field component

import React from 'react';

const EditableField = ({
  value,
  field,
  type = 'text',
  isEditing,
  editingValue,
  onEdit,
  onSave,
  onCancel,
  onChange,
  options = null,
  placeholder = '',
  multiSelect = false,
  displayValue = null
}) => {

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Render dropdown for crop selection
  if (type === 'select' && options) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onSave(e.target.value)}
        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-white text-gray-900 min-w-0 w-full"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-gray-900">
            {option.name}
          </option>
        ))}
      </select>
    );
  }

  // Render multi-select for fields
  if (type === 'multiselect' && options) {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div className="relative">
        <select
          multiple
          value={selectedValues}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
            onSave(selected);
          }}
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-white text-gray-900 min-w-0 w-full"
          size={Math.min(options.length, 4)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id} className="text-gray-900">
              {option.name}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-500 mt-1">
          Hold Ctrl/Cmd to select multiple
        </div>
      </div>
    );
  }

  // Render editable text/number input
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={editingValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onSave}
          className="text-sm font-medium border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors px-2 py-1 min-w-0 flex-1 bg-white text-gray-900"
          autoFocus
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Render clickable display value
  return (
    <div
      className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-50"
      onClick={() => onEdit(value)}
      title={`Click to edit ${field}`}
    >
      {displayValue || value || '—'}
    </div>
  );
};

export default EditableField;