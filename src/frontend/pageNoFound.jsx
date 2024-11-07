import { Link } from "react-router-dom";
import "./pageNotFound.css";

function PageNotFound() {
  const companyName = localStorage.getItem("companyName");

  return (
    <div className="not-found-container">
      <div className="notFound-message">
        <h1 className="error-title">404</h1>
        <p className="error-text">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to={`/${companyName}/dashboard`} className="home-link">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default PageNotFound;
