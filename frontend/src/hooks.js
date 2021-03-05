import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { usePopper } from 'react-popper';

// get fitted view box of svg
export const useViewBox = (rerender) => {
  const svg = useRef();
  const [viewBox, setViewBox] = useState(undefined);

  useEffect(() => {
    // if svg not mounted yet, exit
    if (!svg.current)
      return;
    // get bbox of content in svg
    const { x, y, width, height } = svg.current.getBBox();
    // set view box to bbox, essentially fitting view to content
    setViewBox([x, y, width, height].map((n) => n.toFixed(2)).join(' '));
  }, [rerender]);

  return [svg, viewBox];
};

// use tooltip
export const useTooltip = (delay = 200) => {
  const [show, setShow] = useState(false);
  const [anchor, anchorRef] = useState(null);
  const [tooltip, tooltipRef] = useState(null);

  // tooltip timer
  const timeout = useRef();

  // make tooltip
  const { styles, attributes, update } = usePopper(anchor, tooltip, {
    placement: 'top',
    modifiers: [
      // https://github.com/popperjs/popper-core/issues/1138
      { name: 'computeStyles', options: { adaptive: false } },
      { name: 'offset', options: { offset: [0, 10] } },
      { name: 'flip', options: { rootBoundary: 'document' } }
    ]
  });

  // props to attach to tooltip element
  const tooltipProps = {
    style: styles.popper,
    ...attributes.popper
  };

  // open tooltip
  const open = useCallback(() => {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setShow(true), delay);
  }, [delay]);

  // close tooltip
  const close = useCallback(() => {
    window.clearTimeout(timeout.current);
    setShow(false);
  }, []);

  // attach event listeners
  useEffect(() => {
    if (!anchor)
      return;

    anchor.addEventListener('mouseenter', open);
    anchor.addEventListener('focus', open);
    anchor.addEventListener('mouseleave', close);
    anchor.addEventListener('blur', close);

    return () => {
      anchor.removeEventListener('mouseenter', open);
      anchor.removeEventListener('focus', open);
      anchor.removeEventListener('mouseleave', close);
      anchor.removeEventListener('blur', close);
    };
  }, [anchor, close, open]);

  return { show, anchorRef, tooltipRef, tooltipProps, update };
};
