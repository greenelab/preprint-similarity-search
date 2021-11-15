import { useState } from "react";
import 'tippy.js/dist/tippy.css';

import Header from "./header";
import Search from "./search";
import PreprintInfo from "./preprint-info";
import SimilarJournals from "./similar-journals";
import SimilarPapers from "./similar-papers";
import MapSections from "./map-sections";
import About from "./about";
import Footer from "./footer";
import Status from "./status";
import { empty } from "./status";
import { success } from "./status";

import "./app.css";

// main app component

const App = () => {
  // status state
  const [status, setStatus] = useState(empty);

  // main data
  const [preprint, setPreprint] = useState({});
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
            status,
            setStatus,
            setPreprint,
            setSimilarJournals,
            setSimilarPapers,
            setCoordinates,
          }}
        />
        <Status {...{ status }} />
        {status === success && (
          <>
            <PreprintInfo {...{ preprint }} />
            <hr />
            <SimilarPapers {...{ similarPapers }} />
            <hr />
            <SimilarJournals {...{ similarJournals }} />
          </>
        )}
        <hr />
        <MapSections {...{ coordinates }} />
        <hr />
        <About />
      </main>
      <Footer />
    </>
  );
};

export default App;
