// Calculate based on timeframe and offset
export function calculateDateRange(timeframe, offset) {
  const now = new Date();
  let endDate = new Date();
  endDate.setDate(now.getDate() + offset);

  let startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - timeframe);

  // Format dates to "YYYY-MM-DD"
  const formatDate = (date) => {
    return date.toISOString().split("T")[0]; 
  };

  startDate = formatDate(startDate);
  endDate = formatDate(endDate);

  console.log(
    "Date now ",
    now,
    "Start date: ",
    startDate,
    "End date: ",
    endDate
  );

  return { startDate, endDate };
}


export function formatValueListForDatabase(valuesToAdd) {
    const valuesToArrayTrimAndCapitalizeFirstLetter = valuesToAdd
      .split(",")
      .map((value) => capitalizeFirstLetter(value.trim()));

    return valuesToArrayTrimAndCapitalizeFirstLetter;
  }

  
export const capitalizeFirstLetter = (word) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export function getCurrentDate() {
  const currentDate = new Date().toJSON().slice(0, 10);
  return currentDate;
}


// ## mock for development
export function getUserId() {
    return 1;
}
  

export function mapToHTML(listToMap, htmlElement) {
    let html = "-";
  
    if (listToMap.length !== 0) {
      try {
        html = listToMap.map((element) => htmlElement(element));
      } catch (error) {
        console.error("Error in mapToHTML: ", error);
        html = "Error in displaying the fields";
      }
    }
  
    return html;
  }





  export const validateDate = (date) => {
  // Regex to match the pattern YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(date);
};


// VALUE
export const addValue = (value) => (previousValues) =>
  [...previousValues, value];

export const removeValue = (valueToRemove) => (previousValues) =>
  previousValues.filter((value) => value !== valueToRemove);
