// hooks/useHarvestTableState.js - Manages table state (selection, sorting, editing)

import { useState } from 'react';

export const useHarvestTableState = (initialSort = 'harvestDate') => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [sortField, setSortField] = useState(initialSort);
  const [sortDirection, setSortDirection] = useState('desc'); // Latest entries first

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const startEditing = (entryId, field, currentValue) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    setEditingEntry(entryId);
    setEditingField(field);
    setEditingValue(currentValue || '');
  };

  const cancelEditing = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    setEditingEntry(null);
    setEditingField(null);
    setEditingValue('');
  };

  const updateEditingValue = (value) => {
    setEditingValue(value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isEditing = (entryId, field) =>
    editingEntry === entryId && editingField === field;

  return {
    // Selection
    selectedIds,
    toggleSelection,
    clearSelection,

    // Editing
    editingEntry,
    editingField,
    editingValue,
    startEditing,
    cancelEditing,
    updateEditingValue,
    isEditing,

    // Save timeout
    saveTimeout,
    setSaveTimeout,

    // Sorting
    sortField,
    sortDirection,
    handleSort
  };
};