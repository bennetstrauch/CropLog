
// ==========================
// File: FieldSection.jsx
// ==========================
import React, { useState } from "react";
import { addGenericValues } from "../../service/modifyService";
import { formatValueListForDatabase } from "../../service/utils";

const FieldSection = () => {
  const [fieldsInput, setFieldsInput] = useState("");

  const handleAddFields = async () => {
    const fields = formatValueListForDatabase(fieldsInput)
    try {
      await addGenericValues(fields, "fields");
      setFieldsInput("");
    } catch (err) {
      alert("Failed to add fields.");
    }
  };

  return (
    <section>
      <h2>Add Fields</h2>
      <input
        value={fieldsInput}
        onChange={(e) => setFieldsInput(e.target.value)}
        placeholder="e.g. Field A, Field B"
      />
      <button onClick={handleAddFields}>Add Fields</button>
    </section>
  );
};

export default FieldSection;
