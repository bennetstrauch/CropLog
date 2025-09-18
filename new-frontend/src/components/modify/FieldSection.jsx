import React, { useEffect, useState } from "react";
import AddFieldForm from "./AddFieldForm";
import GenericEntityList from "./GenericEntityList";
import { getFields, updateField, deleteFields } from "../../service/modifyService";

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

  const handleFieldAdded = (newField) => {
    setFields((prev) => [...prev, newField]);
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const currentField = fields.find(f => f.id === id);
      if (!currentField) {
        throw new Error("Field not found");
      }

      const updateData = {
        name: field === "name" ? value : currentField.name,
      };

      const updatedField = await updateField(id, updateData);
      setFields((prev) =>
        prev.map((f) => (f.id === id ? updatedField : f))
      );
    } catch (error) {
      console.error("Failed to update field:", error);
      alert("Failed to update field.");
    }
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await deleteFields(ids);
      setFields((prev) => prev.filter((f) => !ids.includes(f.id)));
    } catch (error) {
      console.error("Failed to delete fields:", error);
      alert("Failed to delete fields.");
    }
  };

  const fieldConfig = [
    {
      key: 'name',
      label: 'Field Name',
      type: 'text',
      editable: true,
      required: true
    }
  ];

  return (
    <div>
      <AddFieldForm onFieldAdded={handleFieldAdded} />

      <GenericEntityList
        title="Field Management"
        entities={fields}
        fields={fieldConfig}
        onUpdate={handleUpdate}
        onDeleteSelected={handleDeleteSelected}
        sortable={['name']}
        defaultSort="name"
        emptyMessage="No fields yet"
      />
    </div>
  );
};

export default FieldSection;