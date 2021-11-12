import Tooltip from "@tippyjs/react";

const link = "https://doi.org/";

// preprint info section

const PreprintInfo = ({
  preprint: { id, title, authors, journal, year, prelim, text },
}) => (
  <section id="your-preprint">
    <h3>
      <i className="fas fa-feather-alt"></i>
      <span>Your Preprint</span>
    </h3>
    {!text && (
      <p>
        <a href={link + id} className="card_detail">
          {title}
        </a>
        <span className="card_detail truncate" tabIndex="0">
          {authors}
        </span>
        <span className="card_detail truncate" tabIndex="0">
          {journal} · {year}
        </span>
      </p>
    )}
    {!text && prelim && (
      <Tooltip content="These results were generated using the PDF version of the preprint, which is less reliable and can reduce the accuracy of predictions. Check back later when the full-text version is available.">
        <p className="center gray">
          <i className="fas fa-info-circle"></i>
          <span>Preliminary results</span>
        </p>
      </Tooltip>
    )}
    {text && (
      <Tooltip content="You uploaded a plain text version of your preprint">
        <p className="center gray">
          <i className="fas fa-info-circle"></i>
          <span>Plain text</span>
        </p>
      </Tooltip>
    )}
  </section>
);

export default PreprintInfo;
