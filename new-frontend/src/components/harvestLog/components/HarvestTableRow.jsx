import React, { useState } from 'react';
import FieldTags from './FieldTags';
import EditableField from './EditableField';

const HarvestTableRow = ({
  entry,
  isSelected,
  isToday,
  index,
  onToggleSelection,
  onDateChange,
  onCropChange,
  onQuantityChange,
  onFieldsClick,
  crops
}) => {
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const isEditing = (field) => editingField === `${entry.id}-${field}`;
  const isArchived = entry.archived === true;

  const startEditing = (field, value) => {
    if (isArchived) return;
    setEditingField(`${entry.id}-${field}`);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const updateEditingValue = (value) => {
    setEditingValue(value);
  };

  const rowBgClass = isArchived
    ? 'bg-gray-50 opacity-60'
    : isSelected
      ? 'bg-blue-50 hover:bg-blue-100'
      : isToday(entry.harvestDate)
        ? 'bg-green-50 hover:bg-green-100'
        : index % 2 === 0
          ? 'bg-white hover:bg-yellow-50'
          : 'bg-yellow-50 hover:bg-yellow-100';

  // All field names: live + archived (with badge)
  const allFieldNames = [
    ...entry.harvestedFieldNames,
    ...(entry.archivedFieldNames || []),
  ];

  return (
    <tr className={`transition-colors duration-150 ${rowBgClass}`} title={isArchived ? 'This record is archived (read-only)' : undefined}>
      {/* Date Column */}
      <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap" style={{width: '15%'}}>
        {isArchived ? (
          <span className="text-sm text-gray-500">{entry.harvestDate}</span>
        ) : (
          <EditableField
            value={entry.harvestDate}
            field="harvestDate"
            type="date"
            isEditing={isEditing('harvestDate')}
            editingValue={editingValue}
            onEdit={(value) => startEditing('harvestDate', value)}
            onSave={(value) => {
              onDateChange(entry.id, value || editingValue);
              cancelEditing();
            }}
            onCancel={cancelEditing}
            onChange={updateEditingValue}
          />
        )}
      </td>

      {/* Crop Column */}
      <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap" style={{width: '50%'}}>
        {isArchived ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{entry.cropName}</span>
            {entry.archivedCropName && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">deleted</span>
            )}
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Archived record">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        ) : (
          <EditableField
            value={entry.cropId}
            field="cropId"
            type="select"
            isEditing={false}
            editingValue=""
            onEdit={() => {}}
            onSave={(value) => onCropChange(entry.id, value)}
            onCancel={() => {}}
            onChange={() => {}}
            options={crops}
            displayValue={entry.cropName}
          />
        )}
      </td>

      {/* Quantity Column */}
      <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap" style={{width: '15%'}}>
        {isArchived ? (
          <span className="text-sm text-gray-600">{entry.quantity}</span>
        ) : (
          <EditableField
            value={entry.quantity}
            field="quantity"
            type="number"
            isEditing={isEditing('quantity')}
            editingValue={editingValue}
            onEdit={(value) => startEditing('quantity', value)}
            onSave={(value) => {
              onQuantityChange(entry.id, value || editingValue);
              cancelEditing();
            }}
            onCancel={cancelEditing}
            onChange={updateEditingValue}
          />
        )}
      </td>

      {/* Unit Column */}
      <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap" style={{width: '10%'}}>
        <div className="flex items-center gap-1 text-sm text-gray-900">
          {entry.measureUnitName}
          {isArchived && entry.archivedMeasureUnitName && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">deleted</span>
          )}
        </div>
      </td>

      {/* Fields Column */}
      <td className="px-2 py-2 sm:px-6 sm:py-4" style={{width: '25%'}}>
        {isArchived ? (
          <div className="flex flex-wrap gap-1">
            {entry.harvestedFieldNames.map(name => (
              <span key={name} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{name}</span>
            ))}
            {(entry.archivedFieldNames || []).map(name => (
              <span key={`arch-${name}`} className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-200">
                {name}
                <span className="text-red-500 font-medium">deleted</span>
              </span>
            ))}
          </div>
        ) : (
          <FieldTags
            fieldNames={allFieldNames}
            onClick={() => onFieldsClick(entry.id, entry.fieldIds)}
          />
        )}
      </td>

      {/* Selection Column */}
      <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-center" style={{width: '5%'}}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(entry.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
          title={isArchived ? 'Select to delete this archived record' : undefined}
        />
      </td>
    </tr>
  );
};

export default HarvestTableRow;
