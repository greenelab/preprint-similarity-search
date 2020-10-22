import React from 'react';

import { ReactComponent as Logo } from './logo.svg';

import './header.css';

// header component

export default () => (
  <header>
    <section>
      <h1>Preprint</h1>
      <h2>Similarity Search</h2>
      <Logo className='logo' />
    </section>
  </header>
);
