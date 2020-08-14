import React from 'react';

import { ReactComponent as Logo } from './logo.svg';

import './header.css';

export default () => (
  <header>
    <section>
      <h1>AnnoRxver</h1>
      <h2>Journal Recommender</h2>
      <Logo className='logo' />
    </section>
  </header>
);
