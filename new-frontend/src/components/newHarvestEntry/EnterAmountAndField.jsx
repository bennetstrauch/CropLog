import FieldButtons from "../harvestFields/FieldButtons";
import { cropsMeasuredIn } from "../ProvideCropsAndFields";

function EnterAmountAndField({
  setHarvestedAmount,
  harvestedFields,
  setHarvestedFields,
  selectedCrop,
}) {
  const cropMeasureUnit = cropsMeasuredIn[selectedCrop];
  const measureUnitCanBeDecimalNumber =
    cropMeasureUnit != "Bunches" ? true : false; //#

  function updateAmountInput(event) {
    const { value } = event.target;
    setHarvestedAmount(value);
  }

  const enterAmountInput = (
    <input
      type="number"
      step={measureUnitCanBeDecimalNumber ? "any" : "number"} // Allow decimals when needed
      name="amount"
      placeholder={`in ${cropMeasureUnit}`}
      onChange={updateAmountInput}
    />
  );

  const FieldButtons = () => (
    <FieldButtons
      selectedFields={harvestedFields}
      setSelectedFields={setHarvestedFields}
      selectedCrop={selectedCrop}
    />
  );


  


  return (
    <div className="enterAmountAndField">
      Enter Amount: &nbsp;
      {enterAmountInput}
      <br />  <br />

      Select Field(s): &nbsp;
      {FieldButtons()}
    </div>
  );
}

export default EnterAmountAndField;
