import { CustomersPage } from "./pages/CustomersPage";

export function App() {
  return (
    <>
      <BackgroundAnimation />
      <CustomersPage />
    </>
  );
}

function BackgroundAnimation() {
  return (
    <div className="background-stage" aria-hidden="true">
      <div className="background-image-layer" />
      <div className="background-grid-layer">
        <div className="background-grid-column">
          <span>01</span>
        </div>
        <div className="background-grid-column">
          <div className="background-beam animate-beam-1" />
          <span>02</span>
        </div>
        <div className="background-grid-column background-grid-column-center">
          <div className="background-beam background-beam-strong animate-beam-2" />
          <div className="background-center-line" />
          <div className="background-beam background-beam-center animate-beam-1" />
          <span>03</span>
        </div>
        <div className="background-grid-column">
          <div className="background-beam background-beam-short animate-beam-3" />
          <span>04</span>
        </div>
        <div className="background-grid-column">
          <span>05</span>
        </div>
      </div>
    </div>
  );
}
