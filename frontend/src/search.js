import { useEffect } from "react";
import { useState } from "react";
import { useCallback } from "react";
import * as Sentry from "@sentry/react";

import { getNeighbors } from "./backend";
import { getNeighborsMetadata } from "./backend";
import { cleanPreprint } from "./backend";
import { cleanNeighbors } from "./backend";

import Tooltip from "./tooltip";

import { loading } from "./status";
import { success } from "./status";

import "./search.css";

const defaultSearch = "e.g. 10.1101/833400";

// search box component

const Search = ({
  status,
  setStatus,
  setPreprint,
  setSimilarJournals,
  setSimilarPapers,
  setCoordinates,
}) => {
  // default query
  const [query, setQuery] = useState(getUrl() || defaultSearch);

  // on type
  const onChange = useCallback(
    (event) => setQuery(event.target.value.trim()),
    []
  );

  // search
  const search = useCallback(
    async (doi, updateUrl = true) => {
      // clean doi
      doi = cleanDoi(doi);

      // update search box with cleaned doi
      setQuery(doi);

      // exit if doi query empty
      if (!doi) return;

      // update url based on search
      if (updateUrl) setUrl(doi);

      // set loading status
      setStatus(loading);

      // get preprint info and neighbor data
      try {
        let { preprint, similarJournals, similarPapers, coordinates } =
          await getNeighbors(doi);
        preprint = cleanPreprint(preprint);
        similarJournals = await getNeighborsMetadata(similarJournals);
        similarPapers = await getNeighborsMetadata(similarPapers);
        similarJournals = cleanNeighbors(similarJournals);
        similarPapers = cleanNeighbors(similarPapers);
        setStatus(success);
        setPreprint(preprint);
        setSimilarJournals(similarJournals);
        setSimilarPapers(similarPapers);
        setCoordinates(coordinates);
      } catch (error) {
        if (error.name !== "CustomError")
          error.message = "Couldn't get results";
        setStatus(error.message);
        setPreprint({});
        setSimilarJournals([]);
        setSimilarPapers([]);
        setCoordinates({});
        Sentry.captureException(error, { tags: { doi } });
      }
    },
    [
      setStatus,
      setPreprint,
      setSimilarJournals,
      setSimilarPapers,
      setCoordinates,
    ]
  );

  // when user navigates back/forward
  const onNav = useCallback(() => {
    // get new doi
    const doi = getUrl();
    if (!doi) return;
    // put doi in search box
    setQuery(doi);
    // run search, without updating url since browser does this automatically
    search(doi, false);
  }, [search]);

  // search for doi in url if any on first load
  useEffect(() => {
    if (getUrl()) search(getUrl());
  }, [search]);

  // listen for user back/forward nav
  useEffect(() => {
    window.addEventListener("popstate", onNav);
    return () => window.removeEventListener("popstate", onNav);
  }, [onNav, search]);

  // render
  return (
    <section id="search">
      <p className="center">
        <i>
          Enter the <a href="https://www.biorxiv.org/">bioRxiv</a> or{" "}
          <a href="https://www.medrxiv.org/">medRxiv</a> DOI of your preprint
        </i>
      </p>
      <form
        className="search"
        onSubmit={(event) => {
          // prevent page from navigating away/refreshing on submit
          event.preventDefault();
          // run search
          search(query);
        }}
      >
        <input
          className="search_input"
          value={query}
          onChange={onChange}
          type="text"
          placeholder="e.g. 10.1101/833400"
          disabled={status === loading}
          onFocus={({ target }) => target.select()}
        />
        <Tooltip content="Search for related papers and journals">
          <button
            className="search_button"
            type="submit"
            disabled={status === loading}
          >
            <i className="fas fa-search"></i>
          </button>
        </Tooltip>
      </form>
    </section>
  );
};

// clean what user types into search box for convenience
// remove everything before first number, eg "doi:"
// remove version at end, eg "v4"
const cleanDoi = (query) =>
  query.replace(/^\D*/g, "").replace(/v\d+$/g, "").trim();

// get doi from url
const getUrl = () =>
  new URLSearchParams(window.location.search.substring(1)).get("doi");

// put doi in url as param
const setUrl = (doi) => {
  const oldUrl = window.location.href;
  const base = window.location.href.split(/[?#]/)[0];
  const newUrl = base + "?doi=" + doi;
  // compare old to new url to prevent duplicate history entries when refreshing
  if (oldUrl !== newUrl) window.history.pushState(null, null, newUrl);
};

export default Search;
