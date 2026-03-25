import React, { useState, useEffect, useMemo, useContext } from "react";
import { usePlan } from "../../context/PlanProvider";
import { trimToFree } from "../../service/apiService";
import { CropsContext } from "../../context/CropsProvider";
import { FieldsContext } from "../../context/FieldsProvider";
import { MeasureUnitsContext } from "../../context/MeasureUnitsProvider";

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

export default function PlanOverageModal({ blocking = false, initialOpen = false, onClose }) {
  const { plan, overage, isOverLimit, reloadPlan } = usePlan();

  const cropsCtx = useContext(CropsContext);
  const fieldsCtx = useContext(FieldsContext);
  const musCtx = useContext(MeasureUnitsContext);

  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);
  const [selectedCropIds, setSelectedCropIds] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [selectedMuIds, setSelectedMuIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // All entities — active and inactive both count toward limit, sorted by name
  const allCrops = [...(cropsCtx?.crops ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const allFields = [...(fieldsCtx?.fields ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const allMus = [...(musCtx?.measureUnits ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  const maxCrops = plan?.limits?.maxCrops ?? 3;
  const maxFields = plan?.limits?.maxFields ?? 2;
  const maxMus = plan?.limits?.maxMeasureUnits ?? 2;

  // Open when blocking=true
  useEffect(() => {
    if (blocking) setOpen(true);
  }, [blocking]);

  // MUs required by selected crops (locked in MU step)
  const requiredMuIds = useMemo(() => {
    const ids = new Set();
    selectedCropIds.forEach((cropId) => {
      const crop = allCrops.find((c) => c.id === cropId);
      if (crop?.measureUnitId) ids.add(crop.measureUnitId);
    });
    return ids;
  }, [selectedCropIds, allCrops]);

  // Steps to show (step 0 is always overview)
  const selectionSteps = useMemo(() => {
    const s = [];
    if (overage.crops > 0) s.push("crops");
    if (overage.fields > 0) s.push("fields");
    if (overage.measureUnits > 0) s.push("measureUnits");
    s.push("confirm");
    return s;
  }, [overage.crops, overage.fields, overage.measureUnits]);

  // step=0 → overview; step=1+ → selectionSteps[step-1]
  const currentStep = step === 0 ? "overview" : (selectionSteps[step - 1] ?? "confirm");

  const toggleId = (id, selected, setSelected, max) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else if (selected.length < max) {
      setSelected([...selected, id]);
    }
  };

  const canProceed = () => {
    if (currentStep === "crops") return selectedCropIds.length === Math.min(maxCrops, allCrops.length);
    if (currentStep === "fields") return selectedFieldIds.length === Math.min(maxFields, allFields.length);
    return true;
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const finalMuIds = [...new Set([...selectedMuIds, ...requiredMuIds])];
      await trimToFree(selectedCropIds, selectedFieldIds, finalMuIds);
      await reloadPlan();
      if (cropsCtx?.reload) await cropsCtx.reload();
      if (fieldsCtx?.reload) await fieldsCtx.reload();
      if (musCtx?.reload) await musCtx.reload();
      setOpen(false);
      setStep(0);
      onClose?.();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    if (!blocking) {
      sessionStorage.setItem("overage_dismissed", "true");
      setOpen(false);
      onClose?.();
    }
  };

  if (!isOverLimit) return null;
  if (!open && !blocking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={!blocking ? handleDismiss : undefined}
      />
      <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-amber-500 rounded-t-lg px-6 py-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Free Plan Limit Exceeded</h3>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Overview */}
          {currentStep === "overview" && (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                Your Free plan allows <strong>{maxCrops} crops</strong>, <strong>{maxFields} fields</strong>, and <strong>{maxMus} measure units</strong>. You currently have:
              </p>
              <ul className="space-y-2 mb-5">
                {overage.crops > 0 && (
                  <li className="flex items-center gap-2 text-sm text-gray-800">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    <span><strong>{plan.currentCounts.crops} crops</strong> — {overage.crops} too many</span>
                  </li>
                )}
                {overage.fields > 0 && (
                  <li className="flex items-center gap-2 text-sm text-gray-800">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    <span><strong>{plan.currentCounts.fields} fields</strong> — {overage.fields} too many</span>
                  </li>
                )}
                {overage.measureUnits > 0 && (
                  <li className="flex items-center gap-2 text-sm text-gray-800">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    <span><strong>{plan.currentCounts.measureUnits} measure units</strong> — {overage.measureUnits} too many</span>
                  </li>
                )}
              </ul>
              <p className="text-xs text-gray-500 mb-5">
                Excess entities will be permanently deleted. Harvest records for deleted crops will be preserved as read-only archives.
              </p>
              <div className="flex gap-3">
                {STRIPE_LINK && (
                  <a
                    href={STRIPE_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center px-4 py-2 text-sm font-semibold text-emerald-900 bg-emerald-100 border border-emerald-300 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    Upgrade to Farm Plan
                  </a>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                >
                  Select what to keep →
                </button>
              </div>
            </div>
          )}

          {/* Select crops */}
          {currentStep === "crops" && (
            <div>
              <p className="text-sm text-gray-800 mb-1">
                Select <strong>{Math.min(maxCrops, allCrops.length)}</strong> crops to keep ({selectedCropIds.length}/{Math.min(maxCrops, allCrops.length)} selected):
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Harvest records for unselected crops will be preserved as read-only archives.
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto border rounded-lg p-2">
                {allCrops.map((crop) => {
                  const checked = selectedCropIds.includes(crop.id);
                  const disabled = !checked && selectedCropIds.length >= maxCrops;
                  const muLabel = crop.measureUnitId && musCtx?.measureUnitsMap?.[crop.measureUnitId]
                    ? (musCtx.measureUnitsMap[crop.measureUnitId].abbreviation || musCtx.measureUnitsMap[crop.measureUnitId].name)
                    : null;
                  return (
                    <label
                      key={crop.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        checked ? "bg-amber-50 border border-amber-300" : "hover:bg-gray-50 border border-transparent"
                      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleId(crop.id, selectedCropIds, setSelectedCropIds, maxCrops)}
                        className="accent-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{crop.name}</span>
                      {!crop.active && <span className="text-xs text-gray-400">(inactive)</span>}
                      {muLabel && <span className="text-xs text-gray-400 ml-auto">{muLabel}</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Select fields */}
          {currentStep === "fields" && (
            <div>
              <p className="text-sm text-gray-800 mb-1">
                Select <strong>{Math.min(maxFields, allFields.length)}</strong> fields to keep ({selectedFieldIds.length}/{Math.min(maxFields, allFields.length)} selected):
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Harvest records that used unselected fields will still show their field names.
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto border rounded-lg p-2">
                {allFields.map((field) => {
                  const checked = selectedFieldIds.includes(field.id);
                  const disabled = !checked && selectedFieldIds.length >= maxFields;
                  return (
                    <label
                      key={field.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        checked ? "bg-amber-50 border border-amber-300" : "hover:bg-gray-50 border border-transparent"
                      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleId(field.id, selectedFieldIds, setSelectedFieldIds, maxFields)}
                        className="accent-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{field.name}</span>
                      {!field.active && <span className="text-xs text-gray-400">(inactive)</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Select measure units */}
          {currentStep === "measureUnits" && (
            <div>
              <p className="text-sm text-gray-800 mb-1">
                Select <strong>up to {maxMus}</strong> measure units to keep ({[...new Set([...selectedMuIds, ...requiredMuIds])].length}/{maxMus} selected):
              </p>
              {requiredMuIds.size > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2">
                  Units used by your selected crops are pre-selected and locked.
                </p>
              )}
              <div className="space-y-2 max-h-52 overflow-y-auto border rounded-lg p-2">
                {allMus.map((mu) => {
                  const locked = requiredMuIds.has(mu.id);
                  const checked = locked || selectedMuIds.includes(mu.id);
                  const totalSelected = selectedMuIds.filter(id => !requiredMuIds.has(id)).length;
                  const disabled = locked || (!checked && totalSelected + requiredMuIds.size >= maxMus);
                  return (
                    <label
                      key={mu.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        locked
                          ? "bg-gray-100 border border-gray-300 cursor-not-allowed"
                          : checked
                          ? "bg-amber-50 border border-amber-300 cursor-pointer"
                          : "hover:bg-gray-50 border border-transparent cursor-pointer"
                      } ${disabled && !locked ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => {
                          if (!locked) toggleId(mu.id, selectedMuIds, setSelectedMuIds, maxMus - requiredMuIds.size);
                        }}
                        className="accent-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{mu.name}</span>
                      {!mu.active && <span className="text-xs text-gray-400">(inactive)</span>}
                      {mu.abbreviation && <span className="text-xs text-gray-400 ml-auto">({mu.abbreviation})</span>}
                      {locked && <span className="text-xs text-gray-500 ml-auto">required</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirm */}
          {currentStep === "confirm" && (
            <div>
              <p className="text-sm font-medium text-gray-800 mb-3">Please review your selection:</p>

              {overage.crops > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Crops</p>
                  <p className="text-sm text-gray-800">
                    Keep: <span className="font-medium text-green-700">
                      {allCrops.filter((c) => selectedCropIds.includes(c.id)).map((c) => c.name).join(", ") || "none"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800">
                    Delete: <span className="font-medium text-red-600">
                      {allCrops.filter((c) => !selectedCropIds.includes(c.id)).map((c) => c.name).join(", ") || "none"}
                    </span>
                  </p>
                </div>
              )}

              {overage.fields > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Fields</p>
                  <p className="text-sm text-gray-800">
                    Keep: <span className="font-medium text-green-700">
                      {allFields.filter((f) => selectedFieldIds.includes(f.id)).map((f) => f.name).join(", ") || "none"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800">
                    Delete: <span className="font-medium text-red-600">
                      {allFields.filter((f) => !selectedFieldIds.includes(f.id)).map((f) => f.name).join(", ") || "none"}
                    </span>
                  </p>
                </div>
              )}

              {overage.measureUnits > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Measure Units</p>
                  <p className="text-sm text-gray-800">
                    Keep: <span className="font-medium text-green-700">
                      {allMus.filter((m) => requiredMuIds.has(m.id) || selectedMuIds.includes(m.id)).map((m) => m.name).join(", ") || "none"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800">
                    Delete: <span className="font-medium text-red-600">
                      {allMus.filter((m) => !requiredMuIds.has(m.id) && !selectedMuIds.includes(m.id)).map((m) => m.name).join(", ") || "none"}
                    </span>
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                <p className="text-xs text-amber-800">
                  Deleted entities are permanently removed. Harvest records for deleted crops will become read-only archives visible in your harvest log.
                </p>
              </div>

              {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex items-center justify-between gap-3">
          <div>
            {step > 0 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {STRIPE_LINK && step > 0 && currentStep !== "overview" && currentStep !== "confirm" && (
              <a
                href={STRIPE_LINK}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-emerald-700 underline transition-colors"
              >
                Upgrade instead
              </a>
            )}
            {!blocking && currentStep === "overview" && (
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Remind me later
              </button>
            )}
            {currentStep === "confirm" ? (
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Applying…" : "Confirm & Apply"}
              </button>
            ) : currentStep !== "overview" ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
