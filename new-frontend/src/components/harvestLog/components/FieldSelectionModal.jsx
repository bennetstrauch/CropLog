import React, { useState, useEffect } from 'react';
import { useFields } from '../../../context/FieldsProvider';

const FieldSelectionModal = ({ isOpen, onClose, selectedFieldIds = [], onUpdate }) => {
  const { fields } = useFields();
  const [tempSelectedFields, setTempSelectedFields] = useState(new Set(selectedFieldIds));

  useEffect(() => {
    setTempSelectedFields(new Set(selectedFieldIds));
  }, [selectedFieldIds, isOpen]);

  if (!isOpen) return null;

  const toggleField = (fieldId) => {
    const newSelection = new Set(tempSelectedFields);
    if (newSelection.has(fieldId)) {
      newSelection.delete(fieldId);
    } else {
      newSelection.add(fieldId);
    }
    setTempSelectedFields(newSelection);
  };

  const handleUpdate = () => {
    onUpdate(Array.from(tempSelectedFields));
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedFields(new Set(selectedFieldIds));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Fields</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => toggleField(field.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border shadow-sm ${
                  tempSelectedFields.has(field.id)
                    ? '!bg-teal-100 !text-teal-800 !border-teal-300 hover:!bg-teal-200'
                    : '!bg-gray-100 !text-gray-700 !border-gray-300 hover:!bg-gray-200'
                }`}
              >
                {field.name}
              </button>
            ))}
          </div>

          {fields.length === 0 && (
            <p className="text-gray-500 text-sm">No fields available</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Fields
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldSelectionModal;