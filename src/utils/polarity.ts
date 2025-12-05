export const polarity = (value: number) => {
  const threshold = 0.1;

  if (value > threshold) return 1;
  else if (value < -threshold) return -1;
  else return 0;
};
