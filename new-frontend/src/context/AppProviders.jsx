// src/context/AppProviders.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { CropsProvider } from "./CropsProvider";
import { FieldsProvider } from "./FieldsProvider";
import { MeasureUnitsProvider } from "./MeasureUnitsProvider";
import { CategoriesProvider } from "./CategoriesProvider";
import { NotificationProvider } from "./NotificationContext";
import { TutorialProvider } from "./TutorialContext";
import { PlanProvider, usePlan } from "./PlanProvider";
import PlanOverageModal from "../components/plan/PlanOverageModal";

function BlockingOverlay() {
  const { isBlocking, isOverLimit, loading } = usePlan();
  if (loading || !isOverLimit) return null;
  return <PlanOverageModal blocking={isBlocking} />;
}

export default function AppProviders({ children }) {
  return (
    <NotificationProvider>
      <TutorialProvider>
        <PlanProvider>
          <CropsProvider>
            <FieldsProvider>
              <MeasureUnitsProvider>
                <CategoriesProvider>
                  <BlockingOverlay />
                  {children ?? <Outlet />}
                </CategoriesProvider>
              </MeasureUnitsProvider>
            </FieldsProvider>
          </CropsProvider>
        </PlanProvider>
      </TutorialProvider>
    </NotificationProvider>
  );
}
