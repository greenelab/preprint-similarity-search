import React from 'react';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { usePopper } from 'react-popper';

import color from 'color';

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

// map gradient colors
const colorA = color('#ff9800');
const colorB = color('#e0e0e0');
const colorC = color('#2196f3');

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
      <Map
        {...{ cells, selectedPc, selectedCell, setSelectedCell, coordinates }}
      />
      {selectedCell && (
        <SelectedCellDetails {...{ selectedCell, selectedPc, setSelectedPc }} />
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

// get principal component number padded with 0's
const getPcNum = (number) => String(number).padStart(2, '0');

// get url of word cloud image
const getCloudUrl = (number) => cloudImages.replace('XX', getPcNum(number));

// cloud image button component
const CloudButton = ({ number, selectedPc, setSelectedPc }) => {
  // component state
  const [hover, setHover] = useState(false);
  const [reference, setReference] = useState(null);
  const [popper, setPopper] = useState(null);

  // tooltip delay
  const delay = 100;
  const timeout = useRef();

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
        data-number={getPcNum(number)}
        data-selected={selectedPc === number}
        onClick={() =>
          selectedPc === number ? setSelectedPc(null) : setSelectedPc(number)
        }
        onMouseEnter={() => {
          window.clearTimeout(timeout.current);
          timeout.current = window.setTimeout(() => setHover(true), delay);
        }}
        onMouseLeave={() => {
          window.clearTimeout(timeout.current);
          setHover(false);
        }}
      >
        <img
          src={getCloudUrl(number)}
          title={'Select principal component ' + getPcNum(number)}
          alt={'Select principal component ' + getPcNum(number)}
          onLoad={update}
        />
      </button>
      {hover &&
        createPortal(
          <img
            ref={setPopper}
            src={getCloudUrl(number)}
            className='cloud_enlarged'
            title={'Select principal component ' + getPcNum(number)}
            alt={'Select principal component ' + getPcNum(number)}
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
const Map = ({
  cells,
  selectedPc,
  selectedCell,
  setSelectedCell,
  coordinates
}) => {
  // component state
  const svg = useRef();
  const [viewBox, setViewBox] = useState('');

  // normalize counts
  const counts = cells.map((cell) => cell.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  for (const cell of cells)
    cell.countStrength = (cell.count - minCount) / (maxCount - minCount);

  // normalize pc scores
  for (const cell of cells) {
    const pc = cell.pcs.find((pc) => pc.name === getPcNum(selectedPc));
    cell.score = pc?.score || 0;
  }
  const absScore = Math.max(...cells.map((cell) => Math.abs(cell.score))) || 1;
  for (const cell of cells)
    cell.scoreStrength = cell.score / absScore;

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
      {cells
        // put selected cell last, so always be on top
        .sort((a, b) => {
          if (a === selectedCell)
            return 1;
          if (b === selectedCell)
            return -1;
          return 0;
        })
        .map((cell, number) => (
          <rect
            key={number}
            className='cell'
            x={cell.x * cellSize - cellSize / 2}
            y={cell.y * cellSize - cellSize / 2}
            width={cellSize}
            height={cellSize}
            data-selected={cell === selectedCell}
            fill={
              selectedPc ?
                colorB
                  .mix(
                    cell.scoreStrength > 0 ? colorA : colorC,
                    Math.abs(cell.scoreStrength)
                  )
                  .hex() :
                '#000000'
            }
            fillOpacity={selectedPc ? 1 : 0.25 + cell.countStrength * 0.75}
            onClick={() =>
              cell === selectedCell ?
                setSelectedCell(null) :
                setSelectedCell(cell)
            }
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
const SelectedCellDetails = ({ selectedCell, selectedPc, setSelectedPc }) => (
  <div>
    <h4>Papers</h4>
    <p>{selectedCell.count.toLocaleString()}</p>
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
      {selectedCell.pcs.slice(0, 5).map(({ name, score }, number) => (
        <span key={number} className='cell_detail_row'>
          <a
            role='button'
            title={'Select principal component ' + getPcNum(parseInt(name))}
            onClick={() => setSelectedPc(parseInt(name))}
          >
            {name}
            {parseInt(name) === selectedPc && (
              <i className='fas fa-check icon'></i>
            )}
          </a>
          <span>{score.toFixed(2)} score</span>
          <br />
        </span>
      ))}
    </p>
  </div>
);
