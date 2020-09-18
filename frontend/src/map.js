import React from 'react';

import { pcColorA } from './map-sections';
import { pcColorB } from './map-sections';
import { pcColorC } from './map-sections';
import { countColorA } from './map-sections';
import { countColorB } from './map-sections';
import { getPcNum } from './map-sections';
import { boost } from './math';
import { useViewBox } from './hooks';

import './map.css';

// size of map cells in svg units. match to bin width of plot data
let cellSize = 0.85;
// increase by small % to reduce anti-alias gaps between cells
cellSize *= 1.02;

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
  const [svg, viewBox] = useViewBox(cells);

  if (!selectedPc) {
    // if no selected pc, color cells by paper count
    // normalize counts
    const counts = cells.map((cell) => cell.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    for (const cell of cells) {
      cell.strength = (cell.count - minCount) / (maxCount - minCount) || 0;
      cell.strength = boost(cell.strength, 1);
    }
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
      cell.strength = cell.score / absScore || 0;
  }

  // render
  return (
    <p>
      <svg ref={svg} viewBox={viewBox} className='map'>
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
              strokeWidth={cellSize / 4}
              onClick={() =>
                cell === selectedCell ?
                  setSelectedCell(null) :
                  setSelectedCell(cell)
              }
            />
          ))
        }
        {typeof coordinates.x === 'number' &&
          typeof coordinates.y === 'number' && (
          <circle
            className='marker'
            strokeWidth={cellSize / 4}
            cx={coordinates.x}
            cy={coordinates.y}
            r={cellSize / 2}
          />
        )}
      </svg>
    </p>
  );
};
