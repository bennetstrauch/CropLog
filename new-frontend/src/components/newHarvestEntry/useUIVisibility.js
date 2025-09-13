import { useMemo } from 'react';

export default function useUIVisibility(selectedCrop, showDateInputField) {
  const visibility = useMemo(() => {
    const cropIsSelected = selectedCrop !== '';
    const cropIsNotSelected = selectedCrop === '';

    return {
      beforeCropSelection: cropIsNotSelected,
      afterCropSelection: cropIsSelected,
      dateInputField: showDateInputField && cropIsNotSelected,
      cropIsSelected,
      cropIsNotSelected,
    };
  }, [selectedCrop, showDateInputField]);

  return visibility;
}