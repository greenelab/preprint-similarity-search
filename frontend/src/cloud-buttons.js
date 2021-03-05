import { createPortal } from "react-dom";

import { startImage } from "./map-sections";
import { endImage } from "./map-sections";
import { range } from "./map-sections";
import { getPcNum } from "./map-sections";
import { getCloudUrl } from "./map-sections";
import { useTooltip } from "./hooks";

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
const CloudButton = ({ number, selectedPc, setSelectedPc }) => {
  // tooltip
  const { show, anchorRef, tooltipRef, tooltipProps, update } = useTooltip();

  // render
  return (
    <>
      <button
        ref={anchorRef}
        className="cloud_button"
        data-number={getPcNum(number)}
        data-selected={selectedPc === number}
        onClick={() =>
          selectedPc === number ? setSelectedPc(null) : setSelectedPc(number)
        }
      >
        <img
          src={getCloudUrl(number)}
          title={"Select principal component " + getPcNum(number)}
          alt={"Select principal component " + getPcNum(number)}
          onLoad={update}
        />
      </button>
      {show &&
        createPortal(
          <img
            ref={tooltipRef}
            src={getCloudUrl(number)}
            className="cloud_enlarged"
            title={"Select principal component " + getPcNum(number)}
            alt={"Select principal component " + getPcNum(number)}
            onLoad={update}
            {...tooltipProps}
          />,
          document.body
        )}
    </>
  );
};
