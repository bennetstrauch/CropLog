import React, { useEffect, useMemo, useState } from "react";
import { getEntriesFilteredBy } from "../../service/apiService";
import { useCrops } from "../../context/CropsProvider";
import { useFields } from "../../context/FieldsProvider";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";
import { getCurrentDate, validateDate } from "../../service/utils";

// Hooks
import { useHarvestTableState } from "./hooks/useHarvestTableState";
import { useHarvestTableActions } from "./hooks/useHarvestTableActions";
import { useHarvestTableSorting } from "./hooks/useHarvestTableSorting";

// Components
import SortableHeader from "./components/SortableHeader";
import EditableField from "./components/EditableField";
import FieldSelectionModal from "./components/FieldSelectionModal";

const HarvestLogTable = ({ dateRange }) => {
  console.log("RENDER HarvestLogTable");

  const [harvestEntries, setHarvestEntries] = useState([]);
  const [fieldModalState, setFieldModalState] = useState({ isOpen: false, entryId: null, selectedFieldIds: [] });
  const { cropsMap, crops } = useCrops();
  const { fieldsMap, fields } = useFields();
  const { measureUnitsMap } = useMeasureUnits();

  // Custom hooks for separation of concerns
  const tableState = useHarvestTableState('harvestDate');
  const { getSortedEntries } = useHarvestTableSorting();
  const tableActions = useHarvestTableActions(updateEntries);

  const enrichedEntries = useMemo(() => {
    return harvestEntries.map((entry) => {
      const crop = cropsMap[entry.cropId];
      const fieldNames = entry.fieldIds
        .map((id) => fieldsMap[id]?.name)
        .filter(Boolean);

      const measureUnit = measureUnitsMap[crop?.measureUnitId];
      const measureUnitDisplay = measureUnit?.abbreviation || measureUnit?.name || "?";

      return {
        id: entry.id,
        harvestDate: entry.date,
        cropId: entry.cropId,
        cropName: crop?.name || "Unknown Crop",
        quantity: entry.harvestedQuantity,
        measureUnitName: measureUnitDisplay,
        harvestedFieldNames: fieldNames,
        fieldIds: entry.fieldIds,
      };
    });
  }, [harvestEntries, cropsMap, fieldsMap, measureUnitsMap]);

  const sortedEntries = getSortedEntries(enrichedEntries, tableState.sortField, tableState.sortDirection);

  useEffect(() => {
    updateEntries();
  }, [dateRange]);

  async function updateEntries() {
    try {
      const fetchedEntries = await getEntriesFilteredBy(dateRange);
      console.log("fetchedEntries: ", fetchedEntries);
      setHarvestEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to fetch harvest entries:", error);
      setHarvestEntries([]);
    }
  }

  const handleFieldUpdate = async (entryId, field, value) => {
    // Validation
    if (field === 'harvestDate' && !validateDate(value)) {
      alert('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }

    if (field === 'quantity' && (isNaN(value) || value <= 0)) {
      alert('Please enter a valid positive number for quantity.');
      return;
    }

    // Find the full entry data
    const fullEntry = enrichedEntries.find(entry => entry.id === entryId);
    await tableActions.updateEntry(entryId, field, value, fullEntry);
    tableState.cancelEditing();
  };

  const handleAutoSave = (entryId, field, value) => {
    if (tableState.saveTimeout) {
      clearTimeout(tableState.saveTimeout);
    }

    const timeout = setTimeout(() => {
      handleFieldUpdate(entryId, field, value);
    }, 2000);

    tableState.setSaveTimeout(timeout);
  };

  const handleDelete = () => {
    if (tableState.selectedIds.length === 0) return;

    tableActions.deleteEntries(tableState.selectedIds);
    tableState.clearSelection();
  };

  const isToday = (date) => getCurrentDate() === date;

  const openFieldModal = (entryId, selectedFieldIds) => {
    setFieldModalState({
      isOpen: true,
      entryId,
      selectedFieldIds
    });
  };

  const closeFieldModal = () => {
    setFieldModalState({ isOpen: false, entryId: null, selectedFieldIds: [] });
  };

  const handleFieldsUpdate = async (entryId, newFieldIds) => {
    const fullEntry = enrichedEntries.find(entry => entry.id === entryId);
    await tableActions.updateEntry(entryId, 'fieldIds', newFieldIds, fullEntry);
  };

  const renderFieldTags = (entry) => {
    const fieldNames = entry.harvestedFieldNames || [];

    return (
      <div
        className="flex flex-wrap gap-1 cursor-pointer"
        onClick={() => openFieldModal(entry.id, entry.fieldIds)}
      >
        {fieldNames.length > 0 ? (
          fieldNames.map((fieldName, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 hover:bg-teal-200 transition-colors border border-teal-200 shadow-sm"
            >
              {fieldName}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm hover:text-teal-600 transition-colors font-medium">
            Click to select fields
          </span>
        )}
      </div>
    );
  };

  const renderEditableField = (entry, field, type = 'text', options = null) => {
    const currentValue = entry[field];
    const isEditing = tableState.isEditing(entry.id, field);

    let displayValue = currentValue;
    let fieldValue = currentValue;

    // Special handling for different field types
    if (field === 'cropId') {
      displayValue = entry.cropName;
      fieldValue = entry.cropId;
    } else if (field === 'fieldIds') {
      displayValue = entry.harvestedFieldNames?.join(', ') || '—';
      fieldValue = entry.fieldIds;
    }

    return (
      <EditableField
        value={fieldValue}
        field={field}
        type={type}
        isEditing={isEditing}
        editingValue={tableState.editingValue}
        onEdit={(value) => tableState.startEditing(entry.id, field, value)}
        onSave={(value) => handleFieldUpdate(entry.id, field, value || tableState.editingValue)}
        onCancel={tableState.cancelEditing}
        onChange={(value) => {
          tableState.updateEditingValue(value);
          handleAutoSave(entry.id, field, value);
        }}
        options={options}
        displayValue={displayValue}
        multiSelect={field === 'fieldIds'}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Harvest Log</h2>
          {sortedEntries.length > 0 && (
            <span className="text-sm text-gray-500">
              {sortedEntries.length} entr{sortedEntries.length !== 1 ? 'ies' : 'y'} total
              {tableState.selectedIds.length > 0 && ` • ${tableState.selectedIds.length} selected`}
            </span>
          )}
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
            </svg>
          </div>
          <h3 className="text-gray-500 font-medium">No harvest entries found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your date range or add new harvest entries</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="harvestDate"
                  currentSort={tableState.sortField}
                  direction={tableState.sortDirection}
                  onSort={tableState.handleSort}
                >
                  Date
                </SortableHeader>
                <SortableHeader
                  field="cropName"
                  currentSort={tableState.sortField}
                  direction={tableState.sortDirection}
                  onSort={tableState.handleSort}
                  className="w-1/4"
                >
                  Crop
                </SortableHeader>
                <SortableHeader
                  field="quantity"
                  currentSort={tableState.sortField}
                  direction={tableState.sortDirection}
                  onSort={tableState.handleSort}
                  className="w-20"
                >
                  Qty
                </SortableHeader>
                <SortableHeader sortable={false}>
                  Unit
                </SortableHeader>
                <SortableHeader
                  field="harvestedFieldNames"
                  currentSort={tableState.sortField}
                  direction={tableState.sortDirection}
                  onSort={tableState.handleSort}
                >
                  Fields
                </SortableHeader>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-24 transition-all duration-200 ${
                    tableState.selectedIds.length > 0
                      ? 'text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50'
                      : 'text-gray-500'
                  }`}
                  onClick={tableState.selectedIds.length > 0 ? handleDelete : undefined}
                  title={tableState.selectedIds.length > 0 ? `Delete ${tableState.selectedIds.length} selected entr${tableState.selectedIds.length > 1 ? 'ies' : 'y'}` : ''}
                >
                  Select {tableState.selectedIds.length > 0 && `(${tableState.selectedIds.length})`}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`transition-colors duration-150 ${
                    tableState.selectedIds.includes(entry.id)
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : isToday(entry.harvestDate)
                        ? 'bg-green-50 hover:bg-green-100'
                        : index % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-yellow-50 hover:bg-yellow-100'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderEditableField(entry, 'harvestDate', 'date')}
                  </td>
                  <td className="px-6 py-4 w-1/4">
                    {renderEditableField(entry, 'cropId', 'select', crops)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-20">
                    {renderEditableField(entry, 'quantity', 'number')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {entry.measureUnitName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderFieldTags(entry)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={tableState.selectedIds.includes(entry.id)}
                      onChange={() => tableState.toggleSelection(entry.id)}
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
      {tableState.selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 select-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {tableState.selectedIds.length} Entr{tableState.selectedIds.length > 1 ? 'ies' : 'y'}
          </button>
        </div>
      )}

      {/* Field Selection Modal */}
      <FieldSelectionModal
        isOpen={fieldModalState.isOpen}
        onClose={closeFieldModal}
        selectedFieldIds={fieldModalState.selectedFieldIds}
        onUpdate={(newFieldIds) => {
          handleFieldsUpdate(fieldModalState.entryId, newFieldIds);
          closeFieldModal();
        }}
      />
    </div>
  );
};

export default HarvestLogTable;
