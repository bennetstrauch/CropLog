

// ==========================
// File: DeleteValueList.jsx
// ==========================
import React from "react";

const DeleteValueList = ({ values, selected, setSelected }) => {
  const toggle = (val) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <ul>
      {values.map((val) => (
        <li key={val}>
          <label>
            <input
              type="checkbox"
              checked={selected.includes(val)}
              onChange={() => toggle(val)}
            />
            {val}
          </label>
        </li>
      ))}
    </ul>
  );
};

export default DeleteValueList;
