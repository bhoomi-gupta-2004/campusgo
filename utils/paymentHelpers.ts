export const getCurrentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};

export const getPaymentDocId = (uid:string) => {
  return `${uid}_${getCurrentMonthKey()}`;
};