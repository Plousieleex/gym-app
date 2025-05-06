export function calculateBMI(height, weight) {
  const heightMeter = height / 100;
  const avgBMI = weight / (heightMeter * heightMeter);

  return avgBMI.toFixed(2) * 1;
}

export default {
  calculateBMI,
};
