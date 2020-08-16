import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';

import './map.css';

const mapData = './data/plot.json';
const pcImages =
  'https://raw.githubusercontent.com/greenelab/annorxiver/master/biorxiv/pca_association_experiment/output/word_pca_similarity/figures/pca_XX_cossim_word_cloud.png';

const startImage = 1;
const endImage = 50;

const cellSize = 10;

export default ({ coordinates }) => {
  const [cells, setCells] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedPc, setSelectedPc] = useState(null);

  useEffect(() => {
    const getMapData = async () =>
      setCells(await (await fetch(mapData)).json());
    getMapData();
  }, []);

  return (
    <section>
      <h3>Map of PubMed Central</h3>
      <PcButtons {...{ selectedPc, setSelectedPc }} />
      <Map {...{ cells, selectedCell, setSelectedCell }} />
      {coordinates.x && coordinates.y && <Marker {...{ coordinates }} />}
      {selectedCell && <SelectedCellDetails {...{ selectedCell }} />}
    </section>
  );
};

const PcButtons = ({ selectedPc, setSelectedPc }) => {
  const images = [];
  for (let index = startImage; index < endImage; index++) {
    images.push(
      <PcButton key={index} {...{ index, selectedPc, setSelectedPc }} />
    );
  }

  return <p className='center'>{images}</p>;
};

const getPcImageSrc = (index) =>
  pcImages.replace('XX', String(index).padStart(2, '0'));

const PcButton = ({ index, selectedPc, setSelectedPc }) => (
  <button
    className='pc_button'
    data-selected={selectedPc === index}
    onClick={() => setSelectedPc(index)}
  >
    <img
      src={getPcImageSrc(index)}
      title={'Principal component ' + index}
      alt={'Principal component ' + index}
    />
  </button>
);

const Map = ({ cells, selectedCell, setSelectedCell }) => {
  const svg = useRef();
  const [viewBox, setViewBox] = useState('');

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
    <svg ref={svg} viewBox={viewBox || undefined} className='map'>
      {cells.map((cell, index) => (
        <rect
          key={index}
          className='cell'
          x={cell.x * cellSize - cellSize / 2}
          y={cell.y * cellSize - cellSize / 2}
          width={cellSize}
          height={cellSize}
          data-selected={cell === selectedCell}
          fillOpacity={0.25 + ((cell.papers - minCount) / countRange) * 0.75}
          onClick={() => setSelectedCell(cell)}
        />
      ))}
    </svg>
  );
};

const Marker = ({ coordinates }) => (
  <circle
    className='marker'
    cx={coordinates.x * cellSize}
    cy={coordinates.y * cellSize}
    r={cellSize / 3}
  />
);

const SelectedCellDetails = ({ selectedCell }) => (
  <div>
    <h4>Papers</h4>
    <p>{selectedCell.papers.toLocaleString()}</p>
    <h4>Top Journals</h4>
    <p>
      {selectedCell.journals.map(({ name, count }, index) => (
        <span key={index} className='cell_detail_row'>
          <span>{name}</span>
          <span>{count.toLocaleString()} papers</span>
          <br />
        </span>
      ))}
    </p>
    <h4>Top Principal Components</h4>
    <p>
      {selectedCell.pcs.map(({ name, score }, index) => (
        <span key={index} className='cell_detail_row'>
          <a
            href={pcImages.replace('XX', name)}
            target='_blank'
            rel='noopener noreferrer'
          >
            {name}
          </a>
          <span>{score.toFixed(2)} score</span>
          <br />
        </span>
      ))}
    </p>
  </div>
);
