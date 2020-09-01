import React from 'react';
import { useState } from 'react';

import Header from './header';
import Search from './search';
import PreprintInfo from './preprint-info';
import SimilarJournals from './similar-journals';
import SimilarPapers from './similar-papers';
import MapSection from './map-section';
import About from './about';
import Footer from './footer';

import './app.css';

import { empty } from './status';

// main app component

export default () => {
  // data status
  const [status, setStatus] = useState(empty);

  // main data
  const [preprintTitle, setPreprintTitle] = useState('');
  const [preprintUrl, setPreprintUrl] = useState('');
  const [similarJournals, setSimilarJournals] = useState([]);
  const [similarPapers, setSimilarPapers] = useState([]);
  const [coordinates, setCoordinates] = useState({});

  // render
  return (
    <>
      <Header />
      <main>
        <Search
          {...{
            preprintTitle,
            preprintUrl,
            setPreprintTitle,
            setPreprintUrl,
            status,
            setStatus,
            setSimilarJournals,
            setSimilarPapers,
            setCoordinates
          }}
        />
        {status !== empty && (
          <PreprintInfo {...{ preprintTitle, preprintUrl, status }} />
        )}
        {status !== empty && <SimilarPapers {...{ similarPapers, status }} />}
        {status !== empty && (
          <SimilarJournals {...{ similarJournals, status }} />
        )}
        <MapSection {...{ coordinates }} />
        <About />
      </main>
      <Footer />
    </>
  );
};
