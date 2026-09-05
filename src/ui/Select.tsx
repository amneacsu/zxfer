import React from 'react';

export const Select = ({
  children,
  onChange,
  value,
}: {
  children: React.ReactNode;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  value: string | undefined;
}) => (
  <select value={value} onChange={onChange}>
    {children}
  </select>
);
