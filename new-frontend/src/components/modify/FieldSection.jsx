import React, { useEffect, useState } from "react";
import AddFieldForm from "./AddFieldForm";
import FieldList from "./FieldList";
import { getFields } from "../../service/modifyService";

const FieldSection = () => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const data = await getFields();
      setFields(data);
    } catch (err) {
      console.error("Failed to fetch fields", err);
    }
  };

  const handleFieldAdded = () => {
    // Reload fields after adding new ones
    loadFields();
  };

  return (
    <div>
      <AddFieldForm onAdded={handleFieldAdded} />
      <FieldList fields={fields} />
    </div>
  );
};

export default FieldSection;