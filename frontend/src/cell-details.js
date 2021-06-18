import { Fragment } from "react";

import Tooltip from "./tooltip";
import { useViewBox } from "./hooks";

import "./cell-details.css";

// lemma plot settings
const maxChars = 20;

// details of selected cell component

const CellDetails = ({ selectedCell }) => {
  // get lemmas from selected cell
  const lemmas = selectedCell.lemmas || [];

  // component state
  const [svg, viewBox] = useViewBox(lemmas);

  // normalize lemma scores
  const scores = lemmas.map((lemma) => lemma.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  for (const lemma of lemmas)
    lemma.strength = (lemma.score - minScore) / (maxScore - minScore) || 0;

  // height of rows and font size of text in svg units (and pixels, because
  // width of svg is matched to view box which is fit to contents)
  const size = 15;

  // width of svg, based on view box
  const width = (viewBox || "").split(" ")[2] || 0;
  // plot area boundaries
  const left = 0;
  const top = 0;
  const right = lemmas.length * size + size;
  const bottom = lemmas.length * size + size;
  // min width of bars
  const minWidth = size / 2;

  return (
    <>
      <h4>Papers</h4>
      <p>{selectedCell.count.toLocaleString()}</p>
      <h4>Top Journals</h4>
      <p>
        {selectedCell.journals.map(({ name, count }, number) => (
          <span key={number} className="cell_detail_row">
            <span className="truncate">{name}</span>
            <span className="truncate">{count.toLocaleString()} papers</span>
          </span>
        ))}
      </p>
      <h4>Top Lemmas</h4>
      <p>
        <svg
          ref={svg}
          viewBox={viewBox}
          className="chart"
          style={{ width: width + "px" }}
        >
          {lemmas.map((lemma, index) => {
            const width = Math.max(lemma.strength * (right - left), minWidth);
            const y = top + (index + 1) * size;
            return (
              <Fragment key={index}>
                <Tooltip content={lemma.name}>
                  <text
                    x={left - size * 0.75}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={size}
                  >
                    {lemma.name.length > maxChars
                      ? lemma.name.substr(0, maxChars) + "..."
                      : lemma.name}
                  </text>
                </Tooltip>
                <rect
                  x={left}
                  y={y - size / 4}
                  width={width}
                  height={size / 2}
                />
              </Fragment>
            );
          })}
          <path
            d={`M ${left} ${top} L ${left} ${bottom} L ${right} ${bottom}`}
            strokeWidth={size / 10}
          />
          <text
            x={(left + right) / 2}
            y={bottom + size * 0.75}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontSize={size}
          >
            Association Strength
          </text>
        </svg>
      </p>
    </>
  );
};

export default CellDetails;
