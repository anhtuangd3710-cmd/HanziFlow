
import React from 'react';
import { IconBase } from './IconBase';

// FIX: The component props are now defined inline with an intersection type
// to ensure all SVG attributes, including 'title', are correctly recognized.
// This resolves a typing error when using this component in VocabSetCard.
// FIX: Added 'title' to the component's props to allow it to be passed down.
export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number; title?: string; }> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </IconBase>
);