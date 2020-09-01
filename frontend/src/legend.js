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
          <span style={{ backgroundColor: pcColorA }}></span>pos pc
          {getPcNum(selectedPc)}
        </span>
        <span>
          <span style={{ backgroundColor: pcColorC }}></span>neg pc
          {getPcNum(selectedPc)}
        </span>
      </>
    )}
    {!selectedPc && (
      <>
        <span>
          <span style={{ backgroundColor: countColorA }}></span>many papers
        </span>
        <span>
          <span style={{ backgroundColor: countColorB }}></span>few papers
        </span>
      </>
    )}
    {coordinates.x && coordinates.y && (
      <>
        <span>
          <span
            style={{
              backgroundColor: 'var(--red)',
              boxShadow: '0 0 0 2px var(--black) inset'
            }}
          ></span>
          your preprint
        </span>
      </>
    )}
  </p>
);
