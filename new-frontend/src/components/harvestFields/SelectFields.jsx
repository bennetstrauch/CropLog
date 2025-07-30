import { useContext } from "react";
import { mapToHTML } from "../../service/utils";
import FieldButton from "./FieldButton";
import { CropsFieldsContext } from "../../context/CropsFieldsProvider";

function SelectFields({}) {
  const { fields } = useContext(CropsFieldsContext);

  // key doesnt seem to work
  const createButtonsForEachField = mapToHTML(fields, (field) => (
    <FieldButton key={field.id} {...{ id: field.id, name: field.name }} />
  ));

  return (
    <div>
      Select Field(s): &nbsp;
      {createButtonsForEachField}
    </div>
  );
}

export default SelectFields;
