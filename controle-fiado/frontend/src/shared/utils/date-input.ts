export function todayInputDateValue() {
  return formatDateInputValue(new Date());
}

export function addDaysInputDateValue(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return formatDateInputValue(value);
}

function formatDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
