import { useMemo } from 'react';

export default function useUIVisibility(selectedCrop) {
  const visibility = useMemo(() => {
    const cropIsSelected = selectedCrop !== '';
    const cropIsNotSelected = selectedCrop === '';

    return {
      beforeCropSelection: cropIsNotSelected,
      afterCropSelection: cropIsSelected,
      cropIsSelected,
      cropIsNotSelected,
    };
  }, [selectedCrop]);

  return visibility;
}