import color from "color";

import "./card.css";

const rankColorA = color("#ff980020");
const rankColorB = color("#ff9800");

const link = "https://www.ncbi.nlm.nih.gov/pmc/articles/";

// related papers section

const SimilarPapers = ({ similarPapers }) => (
  <section id="similar-papers">
    <h3>
      <i className="fas fa-scroll"></i>
      <span>Most Similar Papers</span>
    </h3>
    {similarPapers.map(
      (
        { id, title, authors, year, journal, rank, distance, strength },
        index
      ) => (
        <div key={index} className="card">
          <div
            className="card_score"
            title={"Distance score: " + distance}
            style={{ backgroundColor: rankColorB.mix(rankColorA, strength) }}
          >
            {rank}
          </div>
          <div className="card_details">
            <a href={link + id} title={title} className="card_detail">
              {title}
            </a>
            <div title={authors} className="card_detail truncate" tabIndex="0">
              {authors}
            </div>
            <div
              title={journal + " · " + year}
              className="card_detail truncate"
              tabIndex="0"
            >
              {journal} · {year}
            </div>
          </div>
        </div>
      )
    )}
  </section>
);

export default SimilarPapers;
