import React from 'react';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { usePopper } from 'react-popper';

import './map.css';

// word cloud "principal component" (pc) images
const cloudImages =
  'https://raw.githubusercontent.com/greenelab/annorxiver/master/biorxiv/pca_association_experiment/output/word_pca_similarity/figures/pca_XX_cossim_word_cloud.png';
const startImage = 1;
const endImage = 50;

// map cell data
const mapData = './data/plot.json';
// size of map cells in svg units
const cellSize = 10;

// map section component

export default ({ coordinates }) => {
  // component state
  const [cells, setCells] = useState([]);
  const [selectedPc, setSelectedPc] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // on app start, load map cell data
  useEffect(() => {
    const getMapData = async () =>
      setCells(await (await fetch(mapData)).json());
    getMapData();
  }, []);

  // render
  return (
    <section>
      <h3>Map of PubMed Central</h3>
      <CloudButtons {...{ selectedPc, setSelectedPc }} />
      <Map {...{ cells, selectedCell, setSelectedCell, coordinates }} />
      {selectedCell && (
        <SelectedCellDetails {...{ selectedCell, setSelectedPc }} />
      )}
    </section>
  );
};

// util func to generate range between ints
const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// cloud image buttons section
const CloudButtons = ({ selectedPc, setSelectedPc }) => (
  <p className='center'>
    {range(startImage, endImage).map((number) => (
      <CloudButton key={number} {...{ number, selectedPc, setSelectedPc }} />
    ))}
  </p>
);

// get cloud number padded with 0's
const getCloudNum = (number) => String(number).padStart(2, '0');

// get url of word cloud image
const getCloudUrl = (number) => cloudImages.replace('XX', getCloudNum(number));

// cloud image button component
const CloudButton = ({ number, selectedPc, setSelectedPc }) => {
  // component state
  const [hover, setHover] = useState(false);
  const [reference, setReference] = useState(null);
  const [popper, setPopper] = useState(null);

  // make tooltip
  const { styles, attributes, update } = usePopper(reference, popper, {
    placement: 'top',
    modifiers: [
      // https://github.com/popperjs/popper-core/issues/1138
      { name: 'computeStyles', options: { adaptive: false } },
      { name: 'offset', options: { offset: [0, 10] } }
    ]
  });

  // render
  return (
    <>
      <button
        ref={setReference}
        className='cloud_button'
        data-number={getCloudNum(number)}
        data-selected={selectedPc === number}
        onClick={() => setSelectedPc(number)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          src={getCloudUrl(number)}
          title={'Select principal component ' + getCloudNum(number)}
          alt={'Select principal component ' + getCloudNum(number)}
          onLoad={update}
        />
      </button>
      {hover &&
        createPortal(
          <img
            ref={setPopper}
            src={getCloudUrl(number)}
            className='cloud_enlarged'
            title={'Select principal component ' + getCloudNum(number)}
            alt={'Select principal component ' + getCloudNum(number)}
            onLoad={update}
            style={styles.popper}
            {...attributes.popper}
          />,
          document.body
        )}
    </>
  );
};

// pubmed central map section
const Map = ({ cells, selectedCell, setSelectedCell, coordinates }) => {
  // component state
  const svg = useRef();
  const [viewBox, setViewBox] = useState('');

  // pre-compute some values
  const counts = useMemo(() => cells.map((cell) => cell.papers), [cells]);
  const minCount = useMemo(() => Math.min(...counts), [counts]);
  const maxCount = useMemo(() => Math.max(...counts), [counts]);
  const countRange = useMemo(() => maxCount - minCount, [minCount, maxCount]);

  // set svg viewbox based on bbox of content in it, ie fit view
  useEffect(() => {
    if (!svg.current)
      return;
    const { x, y, width, height } = svg.current.getBBox();
    setViewBox([x, y, width, height].join(' '));
  }, [cells]);

  // render
  return (
    <svg ref={svg} viewBox={viewBox || undefined} className='map'>
      {cells.map((cell, number) => (
        <rect
          key={number}
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
      {coordinates.x && coordinates.y && (
        <circle
          className='marker'
          cx={coordinates.x * cellSize}
          cy={coordinates.y * cellSize}
          r={cellSize / 3}
        />
      )}
    </svg>
  );
};

// details of selected cell section
const SelectedCellDetails = ({ selectedCell, setSelectedPc }) => (
  <div>
    <h4>Papers</h4>
    <p>{selectedCell.papers.toLocaleString()}</p>
    <h4>Top Journals</h4>
    <p>
      {selectedCell.journals.map(({ name, count }, number) => (
        <span key={number} className='cell_detail_row'>
          <span>{name}</span>
          <span>{count.toLocaleString()} papers</span>
          <br />
        </span>
      ))}
    </p>
    <h4>Top Principal Components</h4>
    <p>
      {selectedCell.pcs.map(({ name, score }, number) => (
        <span key={number} className='cell_detail_row'>
          <a
            role='button'
            title={'Select principal component ' + getCloudNum(parseInt(name))}
            onClick={() => setSelectedPc(parseInt(name))}
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
