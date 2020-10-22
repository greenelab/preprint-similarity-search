import { CustomError } from './error';

const backendServer = 'https://api-preprint-similarity-search.greenelab.com/doi/';

// get neighbor and coordinate data from backend
export const getNeighbors = async (query) => {
  // look up data from backend
  const response = await fetch(backendServer + query);
  if (!response.ok)
    throw new Error();
  const neighbors = await response.json();

  // if error returned, throw error with message
  if (neighbors.message)
    throw new CustomError(neighbors.message);

  // extract results
  const preprint = neighbors.paper_info || {};
  const similarJournals = neighbors.journal_neighbors || [];
  const similarPapers = neighbors.paper_neighbors || [];
  const coordinates = neighbors.coordinates || {};

  // remove "PMC" prefix from PMCID's
  const removePMC = (entry) =>
    (entry.pmcid = (entry.pmcid || entry.document || '').replace('PMC', ''));
  similarJournals.forEach(removePMC);
  similarPapers.forEach(removePMC);

  // return results
  return { preprint, similarJournals, similarPapers, coordinates };
};

const metaLookup =
  'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&email=greenescientist@gmail.com&retmode=json&id=';

// look up journal or paper metadata from nih.gov
export const getNeighborsMetadata = async (array) => {
  // get pmcid's for looking up meta data
  const ids = array.map((entry) => entry.pmcid).filter((entry) => entry);

  // look up metadata
  const metadata = (await (await fetch(metaLookup + ids.join(','))).json())
    .result;

  // incorp meta data into journal/paper objects
  const incorp = (entry) => ({ ...entry, ...(metadata[entry.pmcid] || {}) });
  array = array.map(incorp);

  // return results
  return array;
};

// clean preprint data to handle more conveniently
export const cleanPreprint = (preprint) => ({
  // doi
  id: preprint.doi || null,
  // name of paper
  title: preprint.title || '',
  // authors of paper
  authors: (preprint.authors || []).split('; ').join(', '),
  // name of journal
  journal: preprint.publisher || '',
  // year of publication
  year: preprint.accepted_date.split('-')[0] || ''
});

// clean journal or paper neighbor data to handle more conveniently
export const cleanNeighbors = (array) => {
  // get range of distances
  const distances = array.map((entry) => entry.distance);
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  const diff = max - min;

  // sort by smaller distances first
  array.sort((a, b) => a.distance - b.distance);

  // set new values of array. keep only needed props and rename sensibly
  array = array.map((entry, index) => ({
    // pubmed id
    id: entry.pmcid || null,
    // name of paper
    title: entry.title || '',
    // authors of paper
    authors: (entry.authors || [])
      .map((author) => author.name || '')
      .filter((name) => name)
      .join(', '),
    // name of journal
    journal: (entry.fulljournalname || entry.journal || '')
      .split('_')
      .join(' '),
    // year of publication
    year: (entry.pubdate || '').split(' ')[0] || '',
    // distance score
    distance: entry.distance,
    // normalized distance score
    strength: (entry.distance - min) / diff,
    // whole number rank
    rank: index + 1
  }));

  return array;
};
