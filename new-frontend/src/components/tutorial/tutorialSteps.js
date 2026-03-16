const tutorialSteps = [
  {
    targetSelector: null,
    title: "Welcome to CropLog!",
    description: "Let's take a quick tour so you can get started logging your harvests.",
  },
  {
    targetSelector: "#harvest-entry-form",
    title: "Log Harvest Entries",
    description: "This is your main page. Here you can log new harvest entries by selecting a crop, fields, and quantity.",
    position: "bottom",
  },
  {
    targetSelector: "#nav-manage",
    title: "Set Up Your Data First",
    description: "Before you can log entries, you'll need to set up your Crops, Fields, and Measure Units here.",
    position: "top",
  },
  {
    targetSelector: null,
    title: "You're Ready!",
    description: "Head to Manage to add your first crop, field, and measure unit — then start logging harvests.",
    actionButton: {
      label: "Go to Manage →",
      navigateTo: "/modify/crops",
    },
  },
];

export default tutorialSteps;
