import React from 'react';
import { IconBase } from './IconBase';

export const BrainCircuitIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5v.45a.45.45 0 0 1-.45.45A3.5 3.5 0 0 0 3.5 11V14a1 1 0 0 0 1 1h1.5a.5.5 0 0 0 .5-.5V14a1 1 0 0 0-1-1H4.5a2.5 2.5 0 1 1 2.5-2.5.45.45 0 0 1 .45-.45v-.1A3.5 3.5 0 0 1 11 4.5a2.5 2.5 0 0 1 2.5 2.5v.1a.45.45 0 0 1 .45.45A2.5 2.5 0 1 1 16.5 10H15a1 1 0 0 0-1 1v.5a.5.5 0 0 0 .5.5H16a1 1 0 0 0 1-1v-3a3.5 3.5 0 0 0-3.5-3.5A.45.45 0 0 1 13 6.95v-.45A4.5 4.5 0 0 0 12 2z"/>
    <path d="M6.5 11.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM17.5 11.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    <path d="M12 11.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    <path d="M12 20.5v-2"/>
    <path d="M9 16.5v-2"/>
    <path d="M15 16.5v-2"/>
  </IconBase>
);