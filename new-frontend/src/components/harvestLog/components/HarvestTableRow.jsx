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

  const startEditing = (field, value) => {
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

  const rowBgClass = isSelected
    ? 'bg-blue-50 hover:bg-blue-100'
    : isToday(entry.harvestDate)
      ? 'bg-green-50 hover:bg-green-100'
      : index % 2 === 0
        ? 'bg-white hover:bg-gray-50'
        : 'bg-yellow-50 hover:bg-yellow-100';

  return (
    <tr className={`transition-colors duration-150 ${rowBgClass}`}>
      {/* Date Column */}
      <td className="px-6 py-4 whitespace-nowrap" style={{width: '15%'}}>
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
      </td>

      {/* Crop Column */}
      <td className="px-6 py-4 whitespace-nowrap" style={{width: '30%'}}>
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
      </td>

      {/* Quantity Column */}
      <td className="px-6 py-4 whitespace-nowrap" style={{width: '15%'}}>
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
      </td>

      {/* Unit Column */}
      <td className="px-6 py-4 whitespace-nowrap" style={{width: '10%'}}>
        <div className="text-sm text-gray-900">
          {entry.measureUnitName}
        </div>
      </td>

      {/* Fields Column */}
      <td className="px-6 py-4" style={{width: '25%'}}>
        <FieldTags
          fieldNames={entry.harvestedFieldNames}
          onClick={() => onFieldsClick(entry.id, entry.fieldIds)}
        />
      </td>

      {/* Selection Column */}
      <td className="px-6 py-4 whitespace-nowrap text-center" style={{width: '5%'}}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(entry.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
        />
      </td>
    </tr>
  );
};

export default HarvestTableRow;