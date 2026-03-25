import { mapToHTML } from "../../service/utils";
import FieldButton from "./FieldButton";
import { useFields } from "../../context/FieldsProvider";
function SelectFields({ harvestedFieldsRef }) {
  const { fields } = useFields();

  const createButtonsForEachField = mapToHTML(fields.filter(f => f.active), (field) => (
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
      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
        {createButtonsForEachField}
      </div>
    </div>
  );
}

export default SelectFields;
