export const calculateFine = (dueDate, ratePerDay = 5) => {
  const today = new Date();
  const due = new Date(dueDate);

  if (today <= due) return 0;

  const diffTime = today - due;
  const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return daysLate * ratePerDay;
};
