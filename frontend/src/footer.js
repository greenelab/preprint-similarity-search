import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreativeCommonsBy,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

// footer component

const Footer = () => (
  <footer>
    <section>
      <p>
        <a href="https://creativecommons.org/licenses/by/4.0/">
          <FontAwesomeIcon icon={faCreativeCommonsBy} />
          <span>CC BY 4.0</span>
        </a>
        <br />A project of the <a href="https://greenelab.com/">Greene Lab</a>
        <br />
        <a href="https://github.com/greenelab/preprint-similarity-search">
          <FontAwesomeIcon icon={faGithub} />
          <span>View on GitHub</span>
        </a>
      </p>
    </section>
  </footer>
);

export default Footer;
