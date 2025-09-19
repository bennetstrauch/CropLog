// components/SortableHeader.jsx - Reusable sortable table header

import React from 'react';

const SortableHeader = ({ field, currentSort, direction, onSort, children, sortable = true, className = '' }) => {
  const isActive = currentSort === field;

  const SortIcon = () => {
    if (!sortable || !isActive) {
      return sortable ? (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ) : null;
    }

    return direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
        sortable
          ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none'
          : ''
      } ${className}`}
      onClick={sortable ? () => onSort(field) : undefined}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && <SortIcon />}
      </div>
    </th>
  );
};

export default SortableHeader;