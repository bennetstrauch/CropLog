import React, { useEffect, useState } from "react";
import AddFieldForm from "./AddFieldForm";
import GenericEntityList from "./GenericEntityList";
import { getFields, updateField, deleteFields, hardDeleteFields, updateFieldsActiveBatch } from "../../service/modifyService";
import { useFields } from "../../context/FieldsProvider";
import { useNotification } from "../../context/NotificationContext";

const FieldSection = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const { reload: reloadFieldsContext } = useFields();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await getFields();
      setFields(data);
    } catch (err) {
      console.error("Failed to fetch fields", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldAdded = (newField) => {
    setFields((prev) => [...prev, newField]);
    reloadFieldsContext();
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const currentField = fields.find(f => f.id === id);
      if (!currentField) {
        throw new Error("Field not found");
      }

      const updateData = {
        name: field === "name" ? value : currentField.name,
        active: field === "active" ? value : currentField.active,
      };

      const updatedField = await updateField(id, updateData);
      setFields((prev) =>
        prev.map((f) => (f.id === id ? updatedField : f))
      );
      reloadFieldsContext();
    } catch (error) {
      console.error("Failed to update field:", error);
      showNotification("Failed to update field.", "error");
    }
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await deleteFields(ids);
      setFields((prev) => prev.filter((f) => !ids.includes(f.id)));
      reloadFieldsContext();
      showNotification("Marked as inactive.");
    } catch (error) {
      console.error("Failed to delete fields:", error);
      showNotification("Failed to delete fields.", "error");
    }
  };

  const handleHardDelete = async (ids, cascade = false) => {
    await hardDeleteFields(ids, cascade);
    setFields((prev) => prev.filter((f) => !ids.includes(f.id)));
    reloadFieldsContext();
    showNotification("Permanently deleted.");
  };

  const handleBatchToggleActive = async (ids, active) => {
    try {
      await updateFieldsActiveBatch(ids, active);
      setFields((prev) => prev.map(f => ids.includes(f.id) ? { ...f, active } : f));
      reloadFieldsContext();
      showNotification(active ? "Marked as active." : "Marked as inactive.");
    } catch (error) {
      console.error("Failed to update active status:", error);
      showNotification("Failed to update active status.", "error");
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
        onHardDeleteSelected={handleHardDelete}
        onBatchToggleActive={handleBatchToggleActive}
        entityName="Field"
        sortable={['name']}
        defaultSort="name"
        emptyMessage="No fields yet"
        showActiveColumn={true}
        loading={loading}
      />
    </div>
  );
};

export default FieldSection;
