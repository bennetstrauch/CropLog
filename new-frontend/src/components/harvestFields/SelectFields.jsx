import { mapToHTML } from "../../service/utils";
import FieldButton from "./FieldButton";
import { useFields } from "../../context/FieldsProvider";

function SelectFields({ harvestedFieldsRef }) {
  const { fields } = useFields();

  const createButtonsForEachField = mapToHTML(fields, (field) => (
    <FieldButton
      key={field.id}
      id={field.id}
      name={field.name}
      harvestedFieldsRef={harvestedFieldsRef}
    />
  ));

  return (
    <div>
      Select Field(s): &nbsp;
      {createButtonsForEachField}
    </div>
  );
}

export default SelectFields;
