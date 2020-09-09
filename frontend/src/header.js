import React from 'react';

import { ReactComponent as Logo } from './logo.svg';

import './header.css';

// header component

export default () => (
  <header>
    <section>
      <h1>AnnoRxiver</h1>
      <h2>Journal Recommender</h2>
      <Logo className='logo' />
    </section>
  </header>
);
