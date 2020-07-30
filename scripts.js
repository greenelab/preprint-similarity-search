// backend server
let server = "https://api-journal-rec.greenelab.com/doi/";

// map data
let mapData = "/data/pmc_square_plot.json";

// rank color
let rankColor = "#ff9800";

// lookup resources
const googleLookup = "https://www.google.com/search?q=";
const pubMedLookup = "https://www.ncbi.nlm.nih.gov/pmc/articles/";
const metaLookup =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&tool=AnnoRxivir&email=greenescientist@gmail.com&retmode=json&id=";

// dom elements
let searchForm = document.querySelector("#search");
let searchInput = document.querySelector("#search_input");
let searchButton = document.querySelector("#search_button");
let loadingMessage = document.querySelector("#loading_message");
let emptyMessage = document.querySelector("#empty_message");
let errorMessage = document.querySelector("#error_message");
let journalsSection = document.querySelector("#journals_section");
let papersSection = document.querySelector("#papers_section");
let mapSection = document.querySelector("#map_section");
let journalCard = document.querySelector("#journals_section template");
let paperCard = document.querySelector("#papers_section template");
let gridSvg = document.querySelector("#grid");
let legendSvg = document.querySelector("#legend");
let appTitle = document.title;

// global var to hold search box text
let query = "";

// global vars to hold results from backend query
let journals = [];
let papers = [];
let preprintTitle = "";

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
  else query = "";
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
  if (event.type === "submit") event.preventDefault();

  // don't proceed if query empty
  if (!query) return;

  // update url, unless user navigated back/forward which would update url
  // automatically
  if (event.type !== "popstate") updateUrl();

  // show loading message
  showLoading();
  try {
    // save initial query in case user changes text in search box while fetching
    const initialQuery = query;

    // give this fetch a unique id
    let id = newSearch();
    // fetch results from backend
    let results = await (await fetch(server + query)).json();
    // if new search started since fetch began, exit and ignore results
    if (!isLatestSearch(id)) return;

    // extract journals and papers
    journals = results.journal_neighbors || [];
    papers = results.paper_neighbors || [];
    preprintTitle = results.preprint_title || initialQuery;

    // if results empty, throw an error
    if (!journals.length || !papers.length) throw Error("Empty response");

    // otherwise, clean and show results
    journals = cleanArray(journals);
    papers = cleanArray(papers);
    showResults();
  } catch (error) {
    // if any error occurs, show error message
    showError();
    console.error(error);
  }

  // get paper meta data
  papers = await Promise.all([...papers.map(getPaperMeta)]);
  console.log(papers);

  return false;
};

// get meta data of paper
const getPaperMeta = async (paper) => ({
  ...paper,
  paper: await (
    await fetch(metaLookup + paper.paper.pmcid.replace("PMC", ""))
  ).json(),
});

// show loading message and hide other messages and results
const showLoading = () => {
  document.querySelector("#logo").setAttribute("data-spin", true);
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  journalsSection.style.display = "none";
  papersSection.style.display = "none";
};

// show error message and hide other messages and results
const showError = () => {
  document.querySelector("#logo").removeAttribute("data-spin");
  loadingMessage.style.display = "none";
  errorMessage.style.display = "block";
  journalsSection.style.display = "none";
  papersSection.style.display = "none";
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

  // set new values of array
  array = array.map((entry, index) => ({
    journal: (entry.journal || "").split("_").join(" "), // name of journal
    distance: entry.distance, // distance score
    strength: (entry.distance - min) / diff, // normalized distance score
    rank: index + 1, // rank
    paper: { pmcid: entry.pmcid || null }, // pubmed id
  }));

  return array;
};

// make list of journal or paper result cards
const makeCards = (list, template, section) => {
  for (const { rank, journal, paper, distance, strength } of list) {
    // clone template to make new card
    let clone = template.content.cloneNode(true);

    // get sub elements of clone
    let score = clone.querySelector(".score");
    let journalLink = clone.querySelector(".journal a");
    let paperLink = clone.querySelector(".paper a");

    // set score element
    score.innerHTML = rank;
    score.title = "Distance score: " + distance;
    score.style.background =
      rankColor +
      Math.floor((1 - strength) * 255)
        .toString(16)
        .padStart(2, "0");
    score.style.borderColor = rankColor;

    // set journal element
    journalLink.href = googleLookup + journal;
    journalLink.innerHTML = journal;

    // set or remove paper element
    if (paper.pmcid) {
      paperLink.href = pubMedLookup + paper.pmcid;
      paperLink.innerHTML = paper.pmcid;
    } else clone.querySelector(".paper").remove();

    // attach new clone to section
    section.append(clone);
  }
};

// show results and hide messages
const showResults = () => {
  document.querySelector("#logo").removeAttribute("data-spin");
  loadingMessage.style.display = "none";
  errorMessage.style.display = "none";
  journalsSection.style.display = "block";
  papersSection.style.display = "block";
  // mapSection.style.display = "block";

  // set preprint title
  const titleLinks = document.querySelectorAll(".preprint_title a");
  for (const titleLink of titleLinks) {
    titleLink.href = "https://doi.org/" + query;
    titleLink.innerHTML = preprintTitle;
  }

  // delete any existing result elements
  const journalCards = document.querySelectorAll("#journals_section .card");
  const paperCards = document.querySelectorAll("#papers_section .card");
  for (const journalCard of journalCards) journalCard.remove();
  for (const paperCard of paperCards) paperCard.remove();

  // make new journal and paper cards
  makeCards(journals, journalCard, journalsSection);
  makeCards(papers, paperCard, papersSection);
};

// load logo inline for animation on hover and loading
const loadLogo = async () => {
  // get logo and parse source text
  let svg = await (await fetch("logo.svg")).text();
  // get fallback object logo
  let object = document.querySelector("object#logo");
  // insert svg inline after fallback
  object.insertAdjacentHTML("afterEnd", svg);
  // delete fallback
  object.remove();
};
loadLogo();

// add query to url as param
const updateUrl = () => {
  const oldUrl = window.location.href;
  const base = window.location.href.split(/[?#]/)[0];
  const newUrl = base + "?doi=" + query;
  // compare old to new url to prevent duplicate history entries when refreshing
  if (oldUrl !== newUrl) history.pushState(null, null, newUrl);
  // update browser tab title
  document.title = appTitle + " - " + query;
};

// populate search from url on page load
const onUrlChange = (event) => {
  const params = new URLSearchParams(location.search.substring(1));
  const doi = params.get("doi");
  searchInput.value = doi;
  onType();
  onSearch(event);
};

// load hex map data and make static map
const makeMap = async () => {
  // fetch journal bin data
  let data = await (await fetch(mapData)).json();

  // how big, in svg units, to draw each cell
  let cellSize = 5;
  let cellOverlap = 0.5;

  // pre compute count ranges
  let counts = data.map((d) => d.count);
  let minCount = Math.min(...counts);
  let maxCount = Math.max(...counts);
  let countRange = maxCount - minCount;

  // draw each point "d" of data
  for (const d of data) {
    // use cell template already in svg
    const cell = document.createElementNS("http://www.w3.org/2000/svg", "use");
    cell.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#cell");
    cell.setAttribute("class", "cell");

    // position and size cell
    cell.setAttribute("x", d.x * cellSize - cellSize / 2 - cellOverlap / 2);
    cell.setAttribute("y", d.y * cellSize - cellSize / 2 - cellOverlap / 2);
    cell.setAttribute("width", cellSize + cellOverlap);
    cell.setAttribute("height", cellSize + cellOverlap);

    // color cell according to count
    let strength = (d.count - minCount) / countRange; // normalized (0-1) count
    cell.setAttribute("fill-opacity", 0.25 + strength * 0.75);

    // add cell to svg
    gridSvg.append(cell);
  }
};
makeMap();

// add trigger listeners
searchInput.addEventListener("input", onType);
searchForm.addEventListener("submit", onSearch);
window.addEventListener("popstate", onUrlChange);
window.addEventListener("load", onUrlChange);
