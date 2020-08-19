import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useLayoutEffect } from 'react';

import './continue.css';

const delay = 3000;
const target = '#map';

export default () => {
  const [show, setShow] = useState(false);
  const timer = useRef();

  const onScroll = useCallback(() => {
    window.clearTimeout(timer.current);
    if (inView(target))
      setShow(false);
    else
      timer.current = window.setTimeout(() => setShow(true), delay);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useLayoutEffect(() => {
    onScroll();
  });

  return (
    <button
      className='continue_arrow'
      data-show={show}
      disabled={!show}
      onClick={() => document.querySelector(target).scrollIntoView()}
    >
      <i className='fas fa-arrow-down fa-2x'></i>
    </button>
  );
};

// test if view is on or past element
const inView = (query) =>
  document.querySelector(query).getBoundingClientRect().bottom <
  window.innerHeight;
