// File: FieldList.jsx
import React, { useState } from "react";

const FieldList = ({ fields, onDeleteSelected }) => {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selected.length === 0) return alert("No fields selected.");
    if (window.confirm("Delete selected fields?")) {
      onDeleteSelected(selected);
      setSelected([]);
    }
  };

  return (
    <section>
      <h2>Fields</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Field Name</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id}>
              <td>{index + 1}</td>
              <td>{field.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(field.id)}
                  onChange={() => toggle(field.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleDelete}>Delete Selected Fields</button>
    </section>
  );
};

export default FieldList;
