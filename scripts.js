// resources
let server = 'https://api-journal-rec.greenelab.com/doi/';
let mapData = 'data/plot.json';
const googleLink = 'https://www.google.com/search?q=';
const paperLink = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';
const metaLookup =
  'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&tool=AnnoRxivir&email=greenescientist@gmail.com&retmode=json&id=';
const cloudImages =
  'https://raw.githubusercontent.com/greenelab/annorxiver/master/biorxiv/pca_association_experiment/output/word_pca_similarity/figures/pca_XX_cossim_word_cloud.png';

// settings
let rankColor = '#ff9800';

// dom elements
let searchForm = document.querySelector('#search');
let searchInput = document.querySelector('#search_input');
let searchButton = document.querySelector('#search_button');
let loadingMessage = document.querySelector('#loading_message');
let emptyMessage = document.querySelector('#empty_message');
let errorMessage = document.querySelector('#error_message');
let journalsSection = document.querySelector('#journals_section');
let papersSection = document.querySelector('#papers_section');
let mapSection = document.querySelector('#map_section');
let infoSection = document.querySelector('#info_section');
let journalCard = document.querySelector('#journals_section template');
let paperCard = document.querySelector('#papers_section template');
let mapSvg = document.querySelector('#map');
let mapGrid = document.querySelector('#grid');
let marker = document.querySelector('#marker');
let paperCount = document.querySelector('#paper_count');
let topJournals = document.querySelector('#top_journals');
let topPcs = document.querySelector('#top_pcs');
let appTitle = document.title;

// global var to hold search box text
let query = '';

// global vars to hold results from backend query
let journals = [];
let papers = [];
let coordinates = {};

// when user types into search box
const onType = () => {
  // get set query from text typed into input
  query = searchInput.value;
  // remove leading and trailing whitespace
  query = query.trim();
  // remove everything before first number, eg "doi:"
  const index = query.search(/\d/);
  if (index !== -1) query = query.substr(index);
  // if no number, can't be a valid doi, so set query to empty
  else query = '';
};

// singleton and funcs to prevent race conditions in search, eg so an older
// slower search doesn't finish after and overwrite a newer quicker search

// variable to hold the single latest search
let searchId;
// create new unique search id and set it to latest search, and return it
const newSearch = () => (searchId = performance.now());
// check if provided search id is the latest search
const isLatestSearch = (id) => id === searchId;

// when user clicks search button
const onSearch = async (event) => {
  // prevent refreshing page from form submit
  if (event.type === 'submit') event.preventDefault();

  // reset search input to query
  searchInput.value = query;

  // don't proceed if query empty
  if (!query) return;

  // update url, unless user navigated back/forward which would update url
  // automatically
  if (event.type !== 'popstate') updateUrl();

  // show loading message
  showLoading();
  try {
    // give this fetch a unique id
    let id = newSearch();
    // fetch neighbor results from backend
    let neighbors = await (await fetch(server + query)).json();
    // if new search started since fetch began, exit and ignore results
    if (!isLatestSearch(id)) return;

    // extract journals and papers from backend results
    journals = neighbors.journal_neighbors || [];
    papers = neighbors.paper_neighbors || [];
    coordinates = {
      x: neighbors['2d_coord'].dim1,
      y: neighbors['2d_coord'].dim2
    };

    // if results empty, throw an error
    if (!journals.length || !papers.length) throw Error('Empty response');

    // remove "PMC" prefix from PMCID's
    const removePMC = (entry) =>
      (entry.pmcid = (entry.pmcid || entry.document || '').replace('PMC', ''));
    journals.forEach(removePMC);
    papers.forEach(removePMC);

    // get pmcid's of all papers for looking up meta data
    const ids = [...journals, ...papers]
      .map((entry) => entry.pmcid)
      .filter((entry) => entry);
    // lookup metadata from pubmed
    let metadata = (await (await fetch(metaLookup + ids.join(','))).json())
      .result;

    // incorp meta data into journal and paper objects
    const incorp = (entry) => ({ ...entry, ...(metadata[entry.pmcid] || {}) });
    journals = journals.map(incorp);
    papers = papers.map(incorp);

    // clean results
    journals = cleanArray(journals);
    papers = cleanArray(papers);

    // show results
    showResults();
  } catch (error) {
    // if any error occurs, show error message
    showError();
    console.error(error);
  }

  return false;
};

// show loading message and hide other messages and results
const showLoading = () => {
  document.querySelector('#logo').setAttribute('data-spin', true);
  loadingMessage.style.display = 'block';
  errorMessage.style.display = 'none';
  journalsSection.style.display = 'none';
  papersSection.style.display = 'none';
};

// show error message and hide other messages and results
const showError = () => {
  document.querySelector('#logo').removeAttribute('data-spin');
  loadingMessage.style.display = 'none';
  errorMessage.style.display = 'block';
  journalsSection.style.display = 'none';
  papersSection.style.display = 'none';
};

// clean array of journal or paper results
const cleanArray = (array) => {
  // get range of distances
  const distances = array.map((entry) => entry.distance);
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  const diff = max - min;

  // sort by smaller distances first
  array.sort((a, b) => a.distance - b.distance);

  // set new values of array. keep only needed props and rename sensically
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

// make list of journal or paper result cards
const makeCards = (type, list, template, section) => {
  for (const paper of list) {
    // get paper details
    const { id, title, authors, year, journal } = paper;
    const { rank, distance, strength } = paper;

    // clone template to make new card
    let clone = template.content.cloneNode(true);

    // get sub elements of clone
    let score = clone.querySelector('.score');
    let details = clone.querySelector('.details');

    // set score element
    score.innerHTML = rank;
    score.title = 'Distance score: ' + distance;
    score.style.background =
      rankColor +
      Math.floor((1 - strength) * 255)
        .toString(16)
        .padStart(2, '0');
    score.style.borderColor = rankColor;

    // set details element
    if (type === 'journals') {
      const href = googleLink + journal;
      details.innerHTML = `<a href="${href}">${journal}</a>`;
    }
    if (type === 'papers') {
      const href = paperLink + id;
      details.innerHTML += `<a href="${href}" title="${title}">${title}</a>`;
      details.innerHTML += `<br>`;
      details.innerHTML += `<span title="${authors}">${authors}</span>`;
      details.innerHTML += `<br>`;
      const pub = `${journal} · ${year}`;
      details.innerHTML += `<span title="${pub}">${pub}</span>`;
    }

    // attach new clone to section
    section.append(clone);
  }
};

// show results and hide messages
const showResults = () => {
  document.querySelector('#logo').removeAttribute('data-spin');
  loadingMessage.style.display = 'none';
  errorMessage.style.display = 'none';
  journalsSection.style.display = 'block';
  papersSection.style.display = 'block';

  // delete any existing result elements
  const journalCards = document.querySelectorAll('#journals_section .card');
  const paperCards = document.querySelectorAll('#papers_section .card');
  for (const journalCard of journalCards) journalCard.remove();
  for (const paperCard of paperCards) paperCard.remove();

  // make new journal and paper cards
  makeCards('journals', journals, journalCard, journalsSection);
  makeCards('papers', papers, paperCard, papersSection);

  // place marker on map for queried preprint
  marker.setAttribute('cx', coordinates.x);
  marker.setAttribute('cy', coordinates.y);
};

// load logo inline for animation on hover and loading
const loadLogo = async () => {
  // get logo and parse source text
  let svg = await (await fetch('logo.svg')).text();
  // get fallback object logo
  let object = document.querySelector('object#logo');
  // insert svg inline after fallback
  object.insertAdjacentHTML('afterEnd', svg);
  // delete fallback
  object.remove();
};
loadLogo();

// add query to url as param
const updateUrl = () => {
  const oldUrl = window.location.href;
  const base = window.location.href.split(/[?#]/)[0];
  const newUrl = base + '?doi=' + query;
  // compare old to new url to prevent duplicate history entries when refreshing
  if (oldUrl !== newUrl) history.pushState(null, null, newUrl);
  // update browser tab title
  document.title = appTitle + ' - ' + query;
};

// populate search from url on page load
const onUrlChange = (event) => {
  const params = new URLSearchParams(location.search.substring(1));
  const doi = params.get('doi');
  searchInput.value = doi;
  onType();
  onSearch(event);
};

// load hex map data and make static map
const makeMap = async () => {
  // fetch journal bin data
  let data = await (await fetch(mapData)).json();

  // pre compute paper count ranges
  let counts = data.map((d) => d.papers);
  let minCount = Math.min(...counts);
  let maxCount = Math.max(...counts);
  let countRange = maxCount - minCount;

  // draw each point "d" of data
  for (const d of data) {
    // use cell template already in svg
    const cell = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    cell.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#cell');
    cell.setAttribute('class', 'cell');

    // position and size cell
    cell.setAttribute('x', d.x - 0.5);
    cell.setAttribute('y', d.y - 0.5);
    cell.setAttribute('width', 1);
    cell.setAttribute('height', 1);

    // put info into cell element as string
    cell.setAttribute('data-info', JSON.stringify(d));

    // show cell info on click
    cell.addEventListener('click', showCellInfo);

    // color cell according to paper count
    let strength = (d.papers - minCount) / countRange; // normalized (0-1) count
    cell.setAttribute('fill-opacity', 0.25 + strength * 0.75);

    // add cell to svg
    mapGrid.append(cell);
  }

  // center svg view on plotted cells
  const { x, y, width, height } = mapGrid.getBBox();
  mapSvg.setAttribute('viewBox', [x, y, width, height].join(' '));
};
makeMap();

// show cell info when user clicks on it
const showCellInfo = () => {
  // get data from cell attribute
  let info = event.target.dataset.info;
  if (!info) return;
  info = JSON.parse(info);

  // select clicked cell
  document
    .querySelectorAll('.cell')
    .forEach((el) => (el.dataset.selected = false));
  event.target.dataset.selected = true;

  console.log(info);
  // show info section
  infoSection.style.display = 'block';

  // format and display info
  paperCount.innerHTML = info.papers.toLocaleString();
  topJournals.innerHTML = info.journals
    .map(({ name, count }) => {
      count = count.toLocaleString();
      return `${name} <i>(${count} papers)</i>`;
    })
    .join('<br>');
  topPcs.innerHTML = info.pcs
    .map(({ name, score }) => {
      const url = cloudImages.replace('XX', name);
      score = score.toFixed(2);
      return `<a href="${url}" target="_blank">${name} <i>(${score})</i></a>`;
    })
    .join('<br>');
};

// add trigger listeners
searchInput.addEventListener('input', onType);
searchForm.addEventListener('submit', onSearch);
window.addEventListener('popstate', onUrlChange);
window.addEventListener('load', onUrlChange);
