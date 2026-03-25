import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEntriesFilteredBy } from "../../service/apiService";
import { useCrops } from "../../context/CropsProvider";
import { useFields } from "../../context/FieldsProvider";
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";
import { getCurrentDate, validateDate, exportToCsv } from "../../service/utils";
import { useHarvestTableActions } from "./hooks/useHarvestTableActions";
import { useNotification } from "../../context/NotificationContext";

// Components
import HarvestTableHeader from "./components/HarvestTableHeader";
import HarvestTableRow from "./components/HarvestTableRow";
import SortableHeader from "./components/SortableHeader";
import FieldSelectionModal from "./components/FieldSelectionModal";
import TimeframeNav from "./TimeframeNav";
import DateRangeDiv from "./DateRangeDiv";
import DateRangePicker from "./DateRangePicker";
import Spinner from "../universal/Spinner";
import HarvestLogTutorial from "./HarvestLogTutorial";

const HarvestLogTableRefactored = ({ dateRange, setDateRange }) => {
  // Navigation
  const navigate = useNavigate();

  // State
  const [harvestEntries, setHarvestEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const retryIntervalRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState('harvestDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [fieldModalState, setFieldModalState] = useState({
    isOpen: false,
    entryId: null,
    selectedFieldIds: []
  });
  const [isSummaryMode, setIsSummaryMode] = useState(false);
  const [summarySortField, setSummarySortField] = useState('cropName');
  const [summarySortDirection, setSummarySortDirection] = useState('asc');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Context
  const { cropsMap, crops } = useCrops();
  const { fieldsMap, fields } = useFields();
  const { measureUnitsMap } = useMeasureUnits();
  const { showNotification } = useNotification();

  // Actions
  const handleDeleteSuccess = (ids) =>
    setHarvestEntries(prev => prev.filter(e => !ids.includes(e.id)));
  const tableActions = useHarvestTableActions(fetchEntries, handleDeleteSuccess);

  // Data enrichment
  const enrichedEntries = harvestEntries.map((entry) => {
    const crop = entry.cropId ? cropsMap[entry.cropId] : null;
    const liveFieldNames = entry.fieldIds
      .map((id) => fieldsMap[id]?.name)
      .filter(Boolean);
    const archivedFieldNamesList = entry.archivedFieldNames
      ? entry.archivedFieldNames.split(',').map(n => n.trim()).filter(Boolean)
      : [];
    const measureUnit = crop ? measureUnitsMap[crop.measureUnitId] : null;
    const measureUnitDisplay = measureUnit
      ? (measureUnit.abbreviation || measureUnit.name || "?")
      : (entry.archivedMeasureUnitName || "?");

    return {
      id: entry.id,
      harvestDate: entry.date,
      cropId: entry.cropId,
      cropName: (entry.archived && !crop)
        ? (entry.archivedCropName || "Deleted Crop")
        : (crop?.name || "Unknown Crop"),
      archivedCropName: entry.archivedCropName,
      archivedMeasureUnitName: entry.archivedMeasureUnitName || null,
      categoryName: crop?.categoryName || entry.archivedCategoryName || "",
      quantity: entry.harvestedQuantity,
      measureUnitName: measureUnitDisplay,
      harvestedFieldNames: liveFieldNames,
      archivedFieldNames: archivedFieldNamesList,
      fieldIds: entry.fieldIds,
      archived: entry.archived || false,
    };
  });

  // Sorting
  const sortedEntries = [...enrichedEntries].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'harvestedFieldNames') {
      aVal = aVal.join(', ');
      bVal = bVal.join(', ');
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Summary: group by crop, sum quantities, deduplicate fields
  const summaryEntries = Object.values(
    enrichedEntries.reduce((acc, entry) => {
      if (!acc[entry.cropId]) {
        acc[entry.cropId] = {
          cropId: entry.cropId,
          cropName: entry.cropName,
          categoryName: entry.categoryName,
          totalQuantity: 0,
          measureUnitName: entry.measureUnitName,
          fieldNames: new Set(),
          entryCount: 0,
        };
      }
      acc[entry.cropId].totalQuantity += entry.quantity;
      entry.harvestedFieldNames.forEach(f => acc[entry.cropId].fieldNames.add(f));
      acc[entry.cropId].entryCount += 1;
      return acc;
    }, {})
  )
    .map(s => ({ ...s, fieldNames: [...s.fieldNames].sort() }))
    .sort((a, b) => {
      const aVal = a[summarySortField];
      const bVal = b[summarySortField];
      const cmp = typeof aVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal - bVal;
      return summarySortDirection === 'asc' ? cmp : -cmp;
    });

  // Data fetching
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedEntries = await getEntriesFilteredBy(dateRange);
      setHarvestEntries(fetchedEntries);
      setFetchError(false);
    } catch (error) {
      console.error("Failed to fetch harvest entries:", error);
      setHarvestEntries([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Effects
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Auto-retry every 5 seconds on error
  useEffect(() => {
    if (!fetchError) {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
      return;
    }
    retryIntervalRef.current = setInterval(fetchEntries, 5000);
    return () => {
      clearInterval(retryIntervalRef.current);
      retryIntervalRef.current = null;
    };
  }, [fetchError, fetchEntries]);

  // Event handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSummarySort = (field) => {
    if (summarySortField === field) {
      setSummarySortDirection(summarySortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSummarySortField(field);
      setSummarySortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    const { startDate, endDate } = dateRange;
    const dateTag = `${startDate}-to-${endDate}`;

    if (isSummaryMode) {
      const rows = summaryEntries.map(r => ({
        Crop: r.cropName,
        Category: r.categoryName,
        'Total Quantity': r.totalQuantity,
        Unit: r.measureUnitName,
        Fields: r.fieldNames.join(', '),
        Entries: r.entryCount,
      }));
      exportToCsv(rows, `harvest-summary-${dateTag}.csv`);
    } else {
      const rows = sortedEntries.map(e => ({
        Date: e.harvestDate,
        Crop: e.cropName,
        Category: e.categoryName,
        Quantity: e.quantity,
        Unit: e.measureUnitName,
        Fields: e.harvestedFieldNames.join(', '),
      }));
      exportToCsv(rows, `harvest-detail-${dateTag}.csv`);
    }
  };

  const handleToggleSelection = (entryId) => {
    setSelectedIds(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    tableActions.deleteEntries(selectedIds);
    setSelectedIds([]);
  };

  const handleFieldUpdate = async (entryId, field, value) => {
    // Validation
    if (field === 'harvestDate' && !validateDate(value)) {
      showNotification('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }

    if (field === 'quantity' && (isNaN(value) || value <= 0)) {
      showNotification('Please enter a valid positive number for quantity.');
      return;
    }

    const fullEntry = enrichedEntries.find(entry => entry.id === entryId);
    await tableActions.updateEntry(entryId, field, value, fullEntry);
  };

  const openFieldModal = (entryId, selectedFieldIds) => {
    setFieldModalState({ isOpen: true, entryId, selectedFieldIds });
  };

  const closeFieldModal = () => {
    setFieldModalState({ isOpen: false, entryId: null, selectedFieldIds: [] });
  };

  const handleFieldsUpdate = async (entryId, newFieldIds) => {
    const fullEntry = enrichedEntries.find(entry => entry.id === entryId);
    await tableActions.updateEntry(entryId, 'fieldIds', newFieldIds, fullEntry);
  };

  const isToday = (date) => getCurrentDate() === date;

  return (
    <div className="bg-white w-full h-full min-h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">

          {/* Left: back button + title + count + date range */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl"
              style={{ background: 'none', border: 'none', padding: 0, marginTop: 4, borderRadius: 0, fontWeight: 'bold', textShadow: '0.5px 0 0 currentColor' }}
              title="Back to main page"
            >
              🡄
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Harvest Log</h2>
                {sortedEntries.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {sortedEntries.length} entr{sortedEntries.length !== 1 ? 'ies' : 'y'} total
                    {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
                  </span>
                )}
              </div>
              <div className="relative mt-2">
                <div
                  id="harvest-log-date-range"
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => setShowPicker(p => !p)}
                  title="Click to set custom date range"
                >
                  <DateRangeDiv {...dateRange} />
                </div>
                {showPicker && (
                  <DateRangePicker
                    currentRange={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setIsCustomMode(true);
                      setShowPicker(false);
                    }}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Center: Summary toggle + Export */}
          {!loading && sortedEntries.length > 0 && (
            <div className="flex items-center self-center gap-2">
              <button
                id="harvest-log-summary-toggle"
                onClick={() => setIsSummaryMode(prev => !prev)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  isSummaryMode
                    ? '!bg-teal-600 text-white border-teal-600 hover:!bg-teal-700'
                    : '!bg-yellow-50 text-teal-600 border-teal-300 hover:!bg-yellow-100 hover:border-teal-400'
                }`}
              >
                {isSummaryMode ? 'Details' : 'Summary'}
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-200 flex items-center gap-1"
                title={`Export current ${isSummaryMode ? 'summary' : 'detail'} view as CSV`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>
            </div>
          )}

          {/* Right: Timeframe navigation */}
          <div id="harvest-log-timeframe">
            <TimeframeNav
              setDateRange={setDateRange}
              isCustomMode={isCustomMode}
              onPresetSelect={() => setIsCustomMode(false)}
            />
          </div>

        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-12 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-gray-400 text-sm">Loading harvest entries...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && fetchError && (
        <div className="px-6 py-12 text-center">
          <div className="text-red-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h3 className="text-red-500 font-medium">Server unavailable</h3>
          <p className="text-gray-400 text-sm">Could not reach the server. Retrying automatically…</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && sortedEntries.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"/>
            </svg>
          </div>
          <h3 className="text-gray-500 font-medium">No harvest entries found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your date range or add new harvest entries</p>
        </div>
      )}

      {/* Detail Table */}
      {!loading && sortedEntries.length > 0 && !isSummaryMode && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
            <HarvestTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              selectedCount={selectedIds.length}
              onDeleteSelected={handleDeleteSelected}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.map((entry, index) => (
                <HarvestTableRow
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedIds.includes(entry.id)}
                  isToday={isToday}
                  index={index}
                  onToggleSelection={handleToggleSelection}
                  onDateChange={(entryId, value) => handleFieldUpdate(entryId, 'harvestDate', value)}
                  onCropChange={(entryId, value) => handleFieldUpdate(entryId, 'cropId', value)}
                  onQuantityChange={(entryId, value) => handleFieldUpdate(entryId, 'quantity', value)}
                  onFieldsClick={openFieldModal}
                  crops={crops}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Table */}
      {!loading && sortedEntries.length > 0 && isSummaryMode && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{tableLayout: 'fixed'}}>
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="cropName"      currentSort={summarySortField} direction={summarySortDirection} onSort={handleSummarySort} style={{width: '25%'}}>Crop</SortableHeader>
                <SortableHeader field="totalQuantity" currentSort={summarySortField} direction={summarySortDirection} onSort={handleSummarySort} style={{width: '12%'}}>Total Qty</SortableHeader>
                <SortableHeader field="measureUnitName" currentSort={summarySortField} direction={summarySortDirection} onSort={handleSummarySort} style={{width: '8%'}}>Unit</SortableHeader>
                <SortableHeader sortable={false} style={{width: '28%'}}>Fields</SortableHeader>
                <SortableHeader field="categoryName"  currentSort={summarySortField} direction={summarySortDirection} onSort={handleSummarySort} style={{width: '17%'}}>Category</SortableHeader>
                <SortableHeader field="entryCount"    currentSort={summarySortField} direction={summarySortDirection} onSort={handleSummarySort} style={{width: '10%'}}>Entries</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryEntries.map((row, index) => (
                <tr key={row.cropId} className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-yellow-50 hover:bg-yellow-100'}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.cropName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.totalQuantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.measureUnitName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {row.fieldNames.map(name => (
                        <span key={name} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.entryCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Delete Button */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 select-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {selectedIds.length} Entr{selectedIds.length > 1 ? 'ies' : 'y'}
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

      {/* Harvest Log Tutorial */}
      <HarvestLogTutorial loading={loading} hasVisibleEntries={sortedEntries.length > 0} />
    </div>
  );
};

export default HarvestLogTableRefactored;
