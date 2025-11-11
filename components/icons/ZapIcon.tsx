
import React from 'react';
import { IconBase } from './IconBase';

export const ZapIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </IconBase>
);
