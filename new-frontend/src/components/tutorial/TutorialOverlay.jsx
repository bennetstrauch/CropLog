import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTutorial } from "../../context/TutorialContext";
import tutorialSteps from "./tutorialSteps";

const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 160;
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

function TooltipCard({ step, stepIndex, totalSteps, spotlightRect, onNext, onSkip, onAction, navigate }) {
  const isLast = stepIndex === totalSteps - 1;
  let style = {};

  if (spotlightRect) {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const below = spotlightRect.top + spotlightRect.height + TOOLTIP_HEIGHT + 16 < viewportH;

    let top = below
      ? spotlightRect.top + spotlightRect.height + 12
      : spotlightRect.top - TOOLTIP_HEIGHT - 12;

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

  const handleAction = () => {
    if (step.actionButton?.navigateTo) {
      navigate(step.actionButton.navigateTo);
    }
    onAction();
  };

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
          style={{
            background: "none",
            border: "1px solid #555",
            color: "#aaa",
            borderRadius: 6,
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Skip
        </button>

        {step.actionButton ? (
          <button
            onClick={handleAction}
            style={{
              background: "#4f7942",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "5px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {step.actionButton.label}
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              background: "#4f7942",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "5px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {isLast ? "Finish" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TutorialOverlay() {
  const { isActive, currentStep, nextStep, skipTutorial, completeTutorial } = useTutorial();
  const navigate = useNavigate();
  const [spotlightRect, setSpotlightRect] = useState(null);

  const step = tutorialSteps[currentStep];
  const totalSteps = tutorialSteps.length;

  const updateSpotlight = useCallback(() => {
    if (!isActive || !step?.targetSelector) {
      setSpotlightRect(null);
      return;
    }
    setSpotlightRect(getSpotlightRect(step.targetSelector));
  }, [isActive, step]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    return () => window.removeEventListener("resize", updateSpotlight);
  }, [updateSpotlight]);

  if (!isActive) return null;

  const handleNext = () => {
    if (currentStep + 1 >= totalSteps) {
      completeTutorial();
    } else {
      nextStep(totalSteps);
    }
  };

  return (
    <>
      {/* Dark overlay */}
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

      {/* Spotlight cutout using box-shadow trick */}
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
        onNext={handleNext}
        onSkip={skipTutorial}
        onAction={completeTutorial}
        navigate={navigate}
      />
    </>
  );
}
