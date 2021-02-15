import "./spinner.scss";

export function Spinner() {
  return (
    <div className="center">
      <div className="loader">
        <div className="spinner a"></div>
        <div className="spinner b"></div>
        <div className="spinner c"></div>
      </div>
    </div>
  );
}
