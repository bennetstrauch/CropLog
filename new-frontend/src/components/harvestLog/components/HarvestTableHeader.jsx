import React from 'react';
import SortableHeader from './SortableHeader';

const HarvestTableHeader = ({
  sortField,
  sortDirection,
  onSort,
  selectedCount,
  onDeleteSelected
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <SortableHeader
          field="harvestDate"
          currentSort={sortField}
          direction={sortDirection}
          onSort={onSort}
        >
          Date
        </SortableHeader>

        <SortableHeader
          field="cropName"
          currentSort={sortField}
          direction={sortDirection}
          onSort={onSort}
          // className="w-40"
          style={{width: '50%'}}
        >
          Cropname
        </SortableHeader>

        <SortableHeader
          field="quantity"
          currentSort={sortField}
          direction={sortDirection}
          onSort={onSort}
        >
          Qnty
        </SortableHeader>

        <SortableHeader sortable={false}>
          Unit
        </SortableHeader>

        <SortableHeader
          field="harvestedFieldNames"
          currentSort={sortField}
          direction={sortDirection}
          onSort={onSort}
        >
          Fields
        </SortableHeader>

        <th
          className={`px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
            selectedCount > 0
              ? 'text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50'
              : 'text-gray-500'
          }`}
          onClick={selectedCount > 0 ? onDeleteSelected : undefined}
          title={selectedCount > 0 ? `Delete ${selectedCount} selected entr${selectedCount > 1 ? 'ies' : 'y'}` : ''}
        >
          Select {selectedCount > 0 && `(${selectedCount})`}
        </th>
      </tr>
    </thead>
  );
};

export default HarvestTableHeader;