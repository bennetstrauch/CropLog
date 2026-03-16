import React, { useEffect, useState, useCallback } from "react";
import { getLatestHarvestRecord } from "../../service/apiService";
import harvestLogTutorialSteps from "../tutorial/harvestLogTutorialSteps";

const EMPTY_SEEN_KEY = "croplog_harvest_log_empty_seen";
const TOUR_SEEN_KEY = "croplog_harvest_log_tour_seen";

const TOOLTIP_WIDTH = 320;
const SPOTLIGHT_PADDING = 8;

function getSpotlightRect(selector) {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  };
}

function TooltipCard({ step, stepIndex, totalSteps, spotlightRect, onNext, onSkip }) {
  const isLast = stepIndex === totalSteps - 1;
  let style = {};

  if (spotlightRect) {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const tooltipH = 160;
    const below = spotlightRect.top + spotlightRect.height + tooltipH + 16 < viewportH;

    let top = below
      ? spotlightRect.top + spotlightRect.height + 12
      : spotlightRect.top - tooltipH - 12;

    let left = spotlightRect.left + spotlightRect.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(12, Math.min(left, viewportW - TOOLTIP_WIDTH - 12));
    top = Math.max(12, top);

    style = { position: "fixed", top, left, width: TOOLTIP_WIDTH };
  } else {
    style = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: TOOLTIP_WIDTH,
    };
  }

  return (
    <div
      style={{
        ...style,
        zIndex: 10001,
        backgroundColor: "#1a1a2e",
        border: "1px solid #4f7942",
        borderRadius: 10,
        padding: "18px 20px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        color: "#f0f0f0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#7ec876" }}>{step.title}</span>
        <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap", marginLeft: 8, marginTop: 2 }}>
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px", color: "#d0d0d0" }}>
        {step.description}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={onSkip}
          style={{ background: "none", border: "1px solid #555", color: "#aaa", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 }}
        >
          Skip
        </button>
        <button
          onClick={onNext}
          style={{ background: "#4f7942", border: "none", color: "#fff", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          {isLast ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default function HarvestLogTutorial({ loading, hasVisibleEntries }) {
  const [mode, setMode] = useState(null); // null | 'empty' | 'tour'
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);

  const totalSteps = harvestLogTutorialSteps.length;
  const step = harvestLogTutorialSteps[currentStep];

  // Determine which mode to activate on mount
  useEffect(() => {
    const emptyAlreadySeen = localStorage.getItem(EMPTY_SEEN_KEY);
    const tourAlreadySeen = localStorage.getItem(TOUR_SEEN_KEY);
    if (emptyAlreadySeen && tourAlreadySeen) return;

    getLatestHarvestRecord()
      .then(() => {
        if (!tourAlreadySeen) setMode("tour");
      })
      .catch(() => {
        if (!emptyAlreadySeen) setMode("empty");
      });
  }, []);

  // Start spotlight tour once entries are actually rendered in the DOM
  useEffect(() => {
    if (mode === "tour" && !loading && hasVisibleEntries) {
      setTourActive(true);
    }
  }, [mode, loading, hasVisibleEntries]);

  // Update spotlight rect when step changes
  const updateSpotlight = useCallback(() => {
    if (!tourActive || !step?.targetSelector) {
      setSpotlightRect(null);
      return;
    }
    setSpotlightRect(getSpotlightRect(step.targetSelector));
  }, [tourActive, step]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    return () => window.removeEventListener("resize", updateSpotlight);
  }, [updateSpotlight]);

  const dismissEmpty = () => {
    localStorage.setItem(EMPTY_SEEN_KEY, "true");
    setMode(null);
  };

  const skipTour = () => {
    setTourActive(false);
    localStorage.setItem(TOUR_SEEN_KEY, "true");
    setMode(null);
  };

  const nextStep = () => {
    if (currentStep + 1 >= totalSteps) {
      skipTour();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // --- Empty state modal ---
  if (mode === "empty") {
    return (
      <>
        <div
          style={{ position: "fixed", inset: 0, zIndex: 10000, backgroundColor: "rgba(0,0,0,0.65)", pointerEvents: "all" }}
          onClick={dismissEmpty}
        />
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 340,
            zIndex: 10001,
            backgroundColor: "#1a1a2e",
            border: "1px solid #4f7942",
            borderRadius: 10,
            padding: "24px 24px 18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            color: "#f0f0f0",
          }}
        >
          <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>📋</div>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: "#7ec876", margin: "0 0 10px", textAlign: "center" }}>
            Welcome to your Harvest Log!
          </h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#d0d0d0", margin: "0 0 18px", textAlign: "center" }}>
            You don't have any entries yet. Head back and log your first harvest to discover the full functionality.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={dismissEmpty}
              style={{ background: "#4f7942", border: "none", color: "#fff", borderRadius: 6, padding: "7px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Got it
            </button>
          </div>
        </div>
      </>
    );
  }

  // --- Spotlight tour ---
  if (!tourActive) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          pointerEvents: "all",
          backgroundColor: spotlightRect ? "transparent" : "rgba(0,0,0,0.65)",
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {spotlightRect && (
        <div
          style={{
            position: "fixed",
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            zIndex: 10000,
            borderRadius: 6,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
            pointerEvents: "none",
          }}
        />
      )}
      <TooltipCard
        step={step}
        stepIndex={currentStep}
        totalSteps={totalSteps}
        spotlightRect={spotlightRect}
        onNext={nextStep}
        onSkip={skipTour}
      />
    </>
  );
}
