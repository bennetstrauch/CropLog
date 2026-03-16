import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const TUTORIAL_SEEN_KEY = "croplog_tutorial_seen";

const TutorialContext = createContext(null);

export function TutorialProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const startTutorialIfNew = useCallback(() => {
    if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) {
      startTutorial();
    }
  }, [startTutorial]);

  const nextStep = useCallback((totalSteps) => {
    setCurrentStep((prev) => {
      if (prev + 1 >= totalSteps) {
        return prev;
      }
      return prev + 1;
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
  }, []);

  const completeTutorial = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
  }, []);

  const value = useMemo(
    () => ({ isActive, currentStep, startTutorial, startTutorialIfNew, nextStep, skipTutorial, completeTutorial }),
    [isActive, currentStep, startTutorial, startTutorialIfNew, nextStep, skipTutorial, completeTutorial]
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used inside TutorialProvider");
  return ctx;
}
