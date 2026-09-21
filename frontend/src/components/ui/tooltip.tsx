'use client';

import { cloneElement, isValidElement, useId, useState } from 'react';

export interface TooltipProps {
  tip: string;
  children: React.ReactElement;
}

// Tooltip linked to its trigger via aria-describedby on the trigger itself,
// revealed on hover AND keyboard focus. The child must accept standard
// DOM props (button, span with tabIndex, link).
export function Tooltip({ tip, children }: TooltipProps): React.JSX.Element {
  const tipId = useId();
  const [visible, setVisible] = useState(false);

  const trigger = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        'aria-describedby': tipId,
        onMouseEnter: (event: React.MouseEvent) => {
          const handler = children.props.onMouseEnter as
            ((event: React.MouseEvent) => void) | undefined;
          handler?.(event);
          setVisible(true);
        },
        onMouseLeave: (event: React.MouseEvent) => {
          const handler = children.props.onMouseLeave as
            ((event: React.MouseEvent) => void) | undefined;
          handler?.(event);
          setVisible(false);
        },
        onFocus: (event: React.FocusEvent) => {
          const handler = children.props.onFocus as
            ((event: React.FocusEvent) => void) | undefined;
          handler?.(event);
          setVisible(true);
        },
        onBlur: (event: React.FocusEvent) => {
          const handler = children.props.onBlur as
            ((event: React.FocusEvent) => void) | undefined;
          handler?.(event);
          setVisible(false);
        },
      })
    : children;

  return (
    <span className="group relative inline-flex">
      {trigger}
      <span
        id={tipId}
        role="tooltip"
        className={
          'pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 rounded-md border border-line-strong bg-surface-sunken px-3 py-2 font-sans text-xs whitespace-nowrap text-ink shadow-soft transition-opacity duration-quick ' +
          (visible ? 'opacity-100' : 'opacity-0')
        }
      >
        {tip}
      </span>
    </span>
  );
}
