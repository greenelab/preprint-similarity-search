import React from 'react';

import { pcColorA } from './map-sections';
import { pcColorC } from './map-sections';
import { countColorA } from './map-sections';
import { countColorB } from './map-sections';
import { getPcNum } from './map-sections';

import './legend.css';

// map legend component

export default ({ selectedPc, coordinates }) => (
  <p className='legend'>
    {selectedPc && (
      <>
        <span>
          <span
            className='legend_square'
            style={{ backgroundColor: pcColorA }}
          ></span>
          pos pc
          {getPcNum(selectedPc)}
        </span>
        <span>
          <span
            className='legend_square'
            style={{ backgroundColor: pcColorC }}
          ></span>
          neg pc
          {getPcNum(selectedPc)}
        </span>
      </>
    )}
    {!selectedPc && (
      <>
        <span>
          <span
            className='legend_square'
            style={{ backgroundColor: countColorA }}
          ></span>
          many papers
        </span>
        <span>
          <span
            className='legend_square'
            style={{ backgroundColor: countColorB }}
          ></span>
          few papers
        </span>
      </>
    )}
    {coordinates.x && coordinates.y && (
      <>
        <span>
          <span
            className='legend_circle'
            style={{ backgroundColor: 'var(--red)' }}
          ></span>
          your preprint
        </span>
      </>
    )}
  </p>
);
