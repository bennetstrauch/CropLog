
import { useMeasureUnits } from "../../context/MeasureUnitsProvider";

function QuantityInput({
  harvestedQuantity,
  harvestedCrop,
}) {
  const { measureUnitsMap } = useMeasureUnits();
  const cropMeasureUnit = measureUnitsMap[harvestedCrop.measureUnitId];
  // Allow decimals for weight units (kg, tons, etc.) but not for count units
  // const measureUnitCanBeDecimalNumber =
  //   cropMeasureUnit.name && (
  //     cropMeasureUnit.name.toLowerCase().includes('kg') ||
  //     cropMeasureUnit.name.toLowerCase().includes('ton') ||
  //     cropMeasureUnit.name.toLowerCase().includes('pound') ||
  //     cropMeasureUnit.name.toLowerCase().includes('gram')
  //   );

  

  const QuantityInput = (
    <input
    ref={harvestedQuantity}
      type="number"
      // step={measureUnitCanBeDecimalNumber ? "any" : "number"} // Allow decimals when needed
      name="quantity"
      placeholder={`in ${cropMeasureUnit.name}`}
    />
  );  


  return (
    <div className="QuantityInput">

      Enter Quantity: &nbsp;
      {QuantityInput}
      <br />  <br />
      
    </div>
  );
}

export default QuantityInput;
