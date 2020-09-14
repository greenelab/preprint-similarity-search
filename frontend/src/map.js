import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

import { pcColorA } from './map-section';
import { pcColorB } from './map-section';
import { pcColorC } from './map-section';
import { countColorA } from './map-section';
import { countColorB } from './map-section';
import { getPcNum } from './map-section';

import './map.css';

// size of map cells in svg units. match to bin width of plot data
const cellSize = 0.85 + 0.01;

// map component

// pubmed central map section
export default ({
  cells,
  selectedPc,
  selectedCell,
  setSelectedCell,
  coordinates
}) => {
  // component state
  const svg = useRef();
  const [viewBox, setViewBox] = useState('');

  if (!selectedPc) {
    // if no selected pc, color cells by paper count
    // normalize counts
    const counts = cells.map((cell) => cell.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    for (const cell of cells)
      cell.strength = (cell.count - minCount) / (maxCount - minCount);
  } else {
    // if pc selected, color cells by pc score
    // normalize pc scores
    for (const cell of cells) {
      const pc = cell.pcs.find((pc) => pc.name === getPcNum(selectedPc));
      cell.score = pc?.score || 0;
    }
    const absScore =
      Math.max(...cells.map((cell) => Math.abs(cell.score))) || 1;
    for (const cell of cells)
      cell.strength = cell.score / absScore;
  }

  // set svg viewbox based on bbox of content in it, ie fit view
  useEffect(() => {
    if (!svg.current)
      return;
    const { x, y, width, height } = svg.current.getBBox();
    setViewBox([x, y, width, height].join(' '));
  }, [cells]);

  // render
  return (
    <p>
      <svg ref={svg} viewBox={viewBox || undefined} className='map'>
        {
          // put extra selected cell last, so it will always be on top
          cells.concat(selectedCell || []).map((cell, number) => (
            <rect
              key={number}
              className='cell'
              x={cell.x - cellSize / 2}
              y={cell.y - cellSize / 2}
              width={cellSize}
              height={cellSize}
              data-selected={cell === selectedCell}
              fill={
                selectedPc ?
                  pcColorB.mix(
                    cell.strength > 0 ? pcColorA : pcColorC,
                    Math.abs(cell.strength)
                  ) :
                  countColorB.mix(countColorA, cell.strength)
              }
              onClick={() =>
                cell === selectedCell ?
                  setSelectedCell(null) :
                  setSelectedCell(cell)
              }
            />
          ))
        }
        {coordinates.x && coordinates.y && (
          <circle
            className='marker'
            cx={coordinates.x}
            cy={coordinates.y}
            r={cellSize / 2}
          />
        )}
      </svg>
    </p>
  );
};
