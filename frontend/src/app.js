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
import { empty } from './status';

import './app.css';

// main app component

export default () => {
  // main data
  const [preprint, setPreprint] = useState(empty);
  const [similarJournals, setSimilarJournals] = useState(empty);
  const [similarPapers, setSimilarPapers] = useState(empty);
  const [coordinates, setCoordinates] = useState({});

  // render
  return (
    <>
      <Header />
      <main>
        <Search
          {...{
            preprint,
            similarJournals,
            similarPapers,
            setPreprint,
            setSimilarJournals,
            setSimilarPapers,
            setCoordinates
          }}
        />
        <hr />
        <PreprintInfo {...{ preprint }} />
        <hr />
        <SimilarPapers {...{ similarPapers }} />
        <hr />
        <SimilarJournals {...{ similarJournals }} />
        <hr />
        <MapSection {...{ coordinates }} />
        <hr />
        <About />
      </main>
      <Footer />
    </>
  );
};
