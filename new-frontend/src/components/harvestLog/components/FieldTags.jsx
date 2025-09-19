import React from 'react';

const FieldTags = ({ fieldNames = [], onClick }) => {
  return (
    <div
      className="flex flex-wrap gap-1 cursor-pointer"
      onClick={onClick}
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

export default FieldTags;