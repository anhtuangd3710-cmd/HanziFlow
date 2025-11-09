import React from 'react';
import { IconBase } from './IconBase';

export const CheckIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </IconBase>
);
