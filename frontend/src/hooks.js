import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

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
