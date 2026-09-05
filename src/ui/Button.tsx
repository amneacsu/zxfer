import React from 'react';

export const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button onClick={onClick} type="button">
    {children}
  </button>
);
