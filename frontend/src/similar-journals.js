import color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@tippyjs/react";

import "./card.css";

const rankColorA = color("#ff980020");
const rankColorB = color("#ff9800");

const link = "https://www.google.com/search?q=";

// similar journals section

const SimilarJournals = ({ similarJournals }) => (
  <section id="similar-journals">
    <Tooltip content="The closest journals within our generated paper embedding space">
      <h3>
        <FontAwesomeIcon icon={faBookmark}/>
        <span>Most Similar Journals</span>
      </h3>
    </Tooltip>
    {similarJournals.map(({ journal, rank, distance, strength }, index) => (
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
          <a href={link + journal} className="card_detail">
            {journal}
          </a>
        </div>
      </div>
    ))}
  </section>
);

export default SimilarJournals;
