import React from "react";

const DependencyWarningModal = ({ isOpen, dependencies, entityType, onConfirm, onCancel }) => {
  if (!isOpen || !dependencies) return null;

  const { affectedCrops = [], affectedHarvestRecordCount = 0, isFieldDelete = false } = dependencies;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="bg-red-600 rounded-t-lg px-6 py-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Warning: Additional data will be affected</h3>
        </div>

        <div className="p-6">
          {isFieldDelete ? (
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-medium">{affectedHarvestRecordCount} harvest record{affectedHarvestRecordCount !== 1 ? 's' : ''}</span> reference these fields.
              The records will lose this field reference (a snapshot of the field name will be saved for display).
            </p>
          ) : (
            <>
              {affectedCrops.length > 0 && (
                <p className="text-sm text-gray-700 mb-3">
                  The following <span className="font-medium">{affectedCrops.length} crop{affectedCrops.length !== 1 ? 's' : ''}</span> use this {entityType} and will also be deleted:
                </p>
              )}
              {affectedHarvestRecordCount > 0 && (
                <p className="text-sm text-gray-700 mb-4">
                  <span className="font-medium">{affectedHarvestRecordCount} harvest record{affectedHarvestRecordCount !== 1 ? 's' : ''}</span> will be <span className="font-medium text-amber-700">archived (read-only)</span>.
                  Your historical data is preserved — archived records remain visible in the harvest log with the deleted crop name shown.
                </p>
              )}
            </>
          )}

          {affectedCrops.length > 0 && (
            <div className="max-h-40 overflow-y-auto border border-red-200 rounded-lg bg-red-50 p-3 mb-4">
              <ul className="space-y-1">
                {affectedCrops.map(crop => (
                  <li key={crop.id} className="text-sm text-red-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    {crop.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Proceed — Delete Forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyWarningModal;
