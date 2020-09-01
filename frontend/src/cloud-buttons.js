import React from 'react';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useRef } from 'react';
import { usePopper } from 'react-popper';

import { startImage } from './map-section';
import { endImage } from './map-section';
import { range } from './map-section';
import { getPcNum } from './map-section';
import { getCloudUrl } from './map-section';

import './cloud-buttons.css';

// tooltip open delay
const delay = 500;

// cloud image button components

export default ({ selectedPc, setSelectedPc }) => (
  <p className='center'>
    {range(startImage, endImage).map((number) => (
      <CloudButton key={number} {...{ number, selectedPc, setSelectedPc }} />
    ))}
  </p>
);

// cloud image button component
const CloudButton = ({ number, selectedPc, setSelectedPc }) => {
  // component state
  const [hover, setHover] = useState(false);
  const [reference, setReference] = useState(null);
  const [popper, setPopper] = useState(null);

  // tooltip timer
  const timeout = useRef();

  // make tooltip
  const { styles, attributes, update } = usePopper(reference, popper, {
    placement: 'top',
    modifiers: [
      // https://github.com/popperjs/popper-core/issues/1138
      { name: 'computeStyles', options: { adaptive: false } },
      { name: 'offset', options: { offset: [0, 10] } },
      { name: 'flip', options: { rootBoundary: 'document' } }
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
