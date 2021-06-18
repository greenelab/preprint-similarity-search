import { startImage } from "./map-sections";
import { endImage } from "./map-sections";
import { range } from "./map-sections";
import { getPcNum } from "./map-sections";
import { getCloudUrl } from "./map-sections";
import Tooltip from "./tooltip";

import "./cloud-buttons.css";

// cloud image button components

const CloudButtons = ({ selectedPc, setSelectedPc }) => (
  <p className="center">
    {range(startImage, endImage).map((number) => (
      <CloudButton key={number} {...{ number, selectedPc, setSelectedPc }} />
    ))}
  </p>
);

export default CloudButtons;

// cloud image button component
const CloudButton = ({ number, selectedPc, setSelectedPc }) => (
  <Tooltip
    content={
      <img
        src={getCloudUrl(number)}
        className="cloud_enlarged"
        alt={"Principal component " + getPcNum(number)}
        // put min estimated height to avoid flickering
        style={{ minHeight: "300px" }}
      />
    }
  >
    <button
      className="cloud_button"
      data-number={getPcNum(number)}
      data-selected={selectedPc === number}
      title={
        (selectedPc === number ? "Deselect" : "Select") +
        " this principal component"
      }
      onClick={() =>
        selectedPc === number ? setSelectedPc(null) : setSelectedPc(number)
      }
    >
      <img
        src={getCloudUrl(number)}
        alt={"Principal component " + getPcNum(number)}
      />
    </button>
  </Tooltip>
);
