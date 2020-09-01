import React from 'react';

import { getPcNum } from './map-section';

import './cell-details.css';

// details of selected cell component

export default ({ selectedCell, selectedPc, setSelectedPc }) => (
  <div>
    <h4>Papers</h4>
    <p>{selectedCell.count.toLocaleString()}</p>
    <h4>Top Journals</h4>
    <p>
      {selectedCell.journals.map(({ name, count }, number) => (
        <span key={number} className='cell_detail_row'>
          <span className='truncate'>{name}</span>
          <span className='truncate'>{count.toLocaleString()} papers</span>
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
            {parseInt(name) === selectedPc && <i className='fas fa-check'></i>}
          </a>
          <span>{score.toFixed(2)} score</span>
        </span>
      ))}
    </p>
  </div>
);
