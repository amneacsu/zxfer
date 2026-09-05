import React from 'react';

export const Range = ({
  max,
  min,
  onChange,
  step,
  value,
}: {
  max?: number;
  min?: number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  step?: number;
  value: number;
}) => (
  <input
    onChange={onChange}
    max={max}
    min={min}
    step={step}
    type="range"
    value={value}
  />
);
