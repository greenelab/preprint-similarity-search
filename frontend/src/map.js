import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';

import './map.css';

const mapData = './data/plot.json';

export default ({ coordinates }) => {
  const svg = useRef();
  const [cells, setCells] = useState([]);
  const [viewBox, setViewBox] = useState('');

  useEffect(() => {
    const getMapData = async () =>
      setCells(await (await fetch(mapData)).json());
    getMapData();
  }, []);

  const counts = useMemo(() => cells.map((cell) => cell.papers), [cells]);
  const minCount = useMemo(() => Math.min(...counts), [counts]);
  const maxCount = useMemo(() => Math.max(...counts), [counts]);
  const countRange = useMemo(() => maxCount - minCount, [minCount, maxCount]);

  useEffect(() => {
    if (!svg.current)
      return;
    const { x, y, width, height } = svg.current.getBBox();
    setViewBox([x, y, width, height].join(' '));
  }, [cells]);

  return (
    <section>
      <h3>Map of PubMed Central</h3>
      <svg ref={svg} viewBox={viewBox || undefined} className='map'>
        {cells.map((cell, index) => (
          <rect
            key={index}
            className='cell'
            x={cell.x - 0.5}
            y={cell.y - 0.5}
            width='1'
            height='1'
            fillOpacity={0.25 + ((cell.papers - minCount) / countRange) * 0.75}
          />
        ))}
        {coordinates.x && coordinates.y && (
          <circle
            className='marker'
            cx={coordinates.x}
            cy={coordinates.y}
            r='0.35'
          />
        )}
      </svg>
    </section>
  );
};
