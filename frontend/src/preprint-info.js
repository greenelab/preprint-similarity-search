import { createPortal } from "react-dom";
import { useTooltip } from "./hooks";

const link = "https://doi.org/";

// preprint info section

const PreprintInfo = ({
  preprint: { id, title, authors, journal, year, prelim },
}) => {
  // tooltip
  const { show, anchorRef, tooltipRef, tooltipProps } = useTooltip();

  return (
    <section id="your-preprint">
      <h3>
        <i className="fas fa-feather-alt"></i>
        <span>Your Preprint</span>
      </h3>
      <p>
        <a href={link + id} title={title} className="card_detail">
          {title}
        </a>
        <span title={authors} className="card_detail truncate" tabIndex="0">
          {authors}
        </span>
        <span
          title={journal + " · " + year}
          className="card_detail truncate"
          tabIndex="0"
        >
          {journal} · {year}
        </span>
      </p>
      {prelim && (
        <>
          <hr />
          <p ref={anchorRef} className="center gray">
            <i className="fas fa-info-circle"></i>
            <span>Preliminary results</span>
          </p>
          {show &&
            createPortal(
              <span ref={tooltipRef} {...tooltipProps} className="tooltip">
                These results were generated using the PDF version of the
                preprint, which is less reliable and can reduce the accuracy of
                predictions. Check back later when the full-text version is
                available.
              </span>,
              document.body
            )}
        </>
      )}
    </section>
  );
};

export default PreprintInfo;
