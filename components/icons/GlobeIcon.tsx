import React from 'react';
import { IconBase } from './IconBase';

// FIX: Update props to accept standard SVG attributes like 'title'.
// This allows for better accessibility and flexibility, and fixes the type error
// when passing a title prop in VocabSetCard.tsx.
type GlobeIconProps = React.ComponentProps<'svg'> & {
  size?: number;
};


export const GlobeIcon: React.FC<GlobeIconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </IconBase>
);
