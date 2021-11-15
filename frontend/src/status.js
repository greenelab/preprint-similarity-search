import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";

import "./status.css";

// status key codes
export const empty = "EMPTY";
export const loading = "LOADING";
export const success = "SUCCESS";

// loading/error status component

const Status = ({ status }) => {
  if (status === empty) {
    return (
      <section className="center gray">
        <FontAwesomeIcon icon={faExclamation} />
        <span>Search for a doi</span>
      </section>
    );
  }

  if (status === loading) {
    return (
      <section className="center gray">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Loading...</span>
      </section>
    );
  }

  if (status === success) return null;

  return (
    <section className="center red">
      <FontAwesomeIcon icon={faTimesCircle} />
      <span>{status || "Couldn't get results"}</span>
    </section>
  );
};

export default Status;
