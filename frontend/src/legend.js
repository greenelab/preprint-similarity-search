import React from 'react';

import { pcColorA } from './map-section';
import { pcColorC } from './map-section';
import { countColorA } from './map-section';
import { countColorB } from './map-section';
import { getPcNum } from './map-section';

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
