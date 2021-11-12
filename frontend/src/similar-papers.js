import color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@tippyjs/react";

import "./card.css";
import { faScroll } from "@fortawesome/free-solid-svg-icons";

const rankColorA = color("#ff980020");
const rankColorB = color("#ff9800");

const link = "https://www.ncbi.nlm.nih.gov/pmc/articles/";

// related papers section

const SimilarPapers = ({ similarPapers }) => (
  <section id="similar-papers">
    <Tooltip content="The closest paper within our generated paper embedding space">
      <h3>
        <FontAwesomeIcon icon={faScroll} />
        <span>Most Similar Papers</span>
      </h3>
    </Tooltip>
    {similarPapers.map(
      (
        { id, title, authors, year, journal, rank, distance, strength },
        index
      ) => (
        <div key={index} className="card">
          <Tooltip content={"Distance score: " + distance.toFixed(2)}>
            <div
              className="card_score"
              style={{ backgroundColor: rankColorB.mix(rankColorA, strength) }}
            >
              {rank}
            </div>
          </Tooltip>
          <div className="card_details">
            <a href={link + id} className="card_detail">
              {title}
            </a>
            <div className="card_detail truncate" tabIndex="0">
              {authors}
            </div>
            <div className="card_detail truncate" tabIndex="0">
              {journal} · {year}
            </div>
          </div>
        </div>
      )
    )}
  </section>
);

export default SimilarPapers;
