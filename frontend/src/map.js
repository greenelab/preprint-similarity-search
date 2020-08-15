import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';

import './map.css';

const mapData = './data/plot.json';
const cloudImages =
  'https://raw.githubusercontent.com/greenelab/annorxiver/master/biorxiv/pca_association_experiment/output/word_pca_similarity/figures/pca_XX_cossim_word_cloud.png';

const cellSize = 10;

export default ({ coordinates }) => {
  const svg = useRef();
  const [cells, setCells] = useState([]);
  const [viewBox, setViewBox] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);

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
        {cells
          .sort((a, b) => {
            if (a === selectedCell)
              return 1;
            if (b === selectedCell)
              return -1;
            return 0;
          })
          .map((cell, index) => (
            <rect
              key={index}
              className='cell'
              x={cell.x * cellSize - cellSize / 2}
              y={cell.y * cellSize - cellSize / 2}
              width={cellSize}
              height={cellSize}
              data-selected={cell === selectedCell}
              fillOpacity={
                0.25 + ((cell.papers - minCount) / countRange) * 0.75
              }
              onClick={() => setSelectedCell(cell)}
            />
          ))}
        {coordinates.x && coordinates.y && (
          <circle
            className='marker'
            cx={coordinates.x * cellSize}
            cy={coordinates.y * cellSize}
            r={cellSize / 3}
          />
        )}
      </svg>
      {selectedCell && (
        <div>
          <h4>Papers</h4>
          <p>{selectedCell.papers.toLocaleString()}</p>
          <h4>Top Journals</h4>
          <p>
            {selectedCell.journals.map(({ name, count }, index) => (
              <div key={index} className='cell_detail_row'>
                <span>{name}</span>
                <span>{count.toLocaleString()} papers</span>
                <br />
              </div>
            ))}
          </p>
          <h4>Top Principal Components</h4>
          <p>
            {selectedCell.pcs.map(({ name, score }, index) => (
              <div key={index} className='cell_detail_row'>
                <a
                  href={cloudImages.replace('XX', name)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {name}
                </a>
                <span>{score.toFixed(2)} score</span>
                <br />
              </div>
            ))}
          </p>
        </div>
      )}
    </section>
  );
};
