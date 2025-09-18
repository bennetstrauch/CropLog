import React from "react";
import AddMeasureUnitForm from "./AddMeasureUnitForm";

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: "12px",
    padding: "24px",
    width: "90%",
    maxWidth: "600px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  header: {
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "16px",
  },
  cancelButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
};

const MeasureUnitModal = ({ onClose, onMeasureUnitCreated }) => {
  const handleMeasureUnitAdded = (newMeasureUnit) => {
    onMeasureUnitCreated(newMeasureUnit);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={modalStyles.header}>
          Add New Measure Unit
        </h2>

        <AddMeasureUnitForm onAdded={handleMeasureUnitAdded} />

        <div style={modalStyles.footer}>
          <button
            style={modalStyles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasureUnitModal;