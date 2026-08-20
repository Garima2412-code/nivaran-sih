// Produces IDs like GRV-2026-004821
const generateGrievanceId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random
  return `GRV-${year}-${random}`;
};

module.exports = generateGrievanceId;