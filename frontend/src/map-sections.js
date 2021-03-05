import { useState } from "react";
import { useEffect } from "react";

import CloudButtons from "./cloud-buttons";
import Map from "./map";
import Legend from "./legend";
import CellDetails from "./cell-details";

import color from "color";

// map cell data
const mapData = "./data/plot.json";

// word cloud "principal component" (pc) images
export const cloudImages =
  "https://raw.githubusercontent.com/greenelab/annorxiver/master/biorxiv/pca_association_experiment/output/word_pca_similarity/figure_pieces/pca_XX_cossim_word_cloud.png";
export const startImage = 1;
export const endImage = 50;

// map count color;
export const countColorA = color("#606060");
export const countColorB = color("#e0e0e0");

// map principal component gradient colors
export const pcColorA = color("#ff9800");
export const pcColorB = color("#ffffff");
export const pcColorC = color("#2196f3");

// map sections component

const MapSections = ({ coordinates }) => {
  // component state
  const [cells, setCells] = useState([]);
  const [selectedPc, setSelectedPc] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // on app start, load map cell data
  useEffect(() => {
    const getMapData = async () =>
      setCells(await (await fetch(mapData)).json());
    getMapData();
  }, []);

  // render
  return (
    <>
      <section id="map">
        <h3>
          <i className="fas fa-map"></i>
          <span>Map of PubMed Central</span>
        </h3>
        <CloudButtons {...{ selectedPc, setSelectedPc }} />
        <Map
          {...{ cells, selectedPc, selectedCell, setSelectedCell, coordinates }}
        />
        <Legend {...{ selectedPc, coordinates }} />
      </section>
      {selectedCell && (
        <>
          <hr />
          <section id="cell-details">
            <h3>
              <i className="fas fa-square"></i>
              <span>Selected Square</span>
            </h3>
            <CellDetails {...{ selectedCell, selectedPc, setSelectedPc }} />
          </section>
        </>
      )}
    </>
  );
};

export default MapSections;

// util func to generate range between ints
export const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// get principal component number padded with 0's
export const getPcNum = (number) => String(number).padStart(2, "0");

// get url of word cloud image
export const getCloudUrl = (number) =>
  cloudImages.replace("XX", getPcNum(number));
