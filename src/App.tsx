import { useCallback, useState } from "react";
import { ReactComponent as Map } from "./assets/map.svg";
import "./App.css";

function App() {
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => setZoom((prev) => prev + 1), [setZoom]);
  const zoomOut = useCallback(() => setZoom((prev) => prev - 1), [setZoom]);

  const translateX = 0;
  const translateY = 0;

  const mapStyles = {
    // transform: `scale(${zoom}, ${zoom})`,
    // transform: `matrix3d(${zoom}, 0, 0, 0, 0, ${zoom}, 0, 0, 0, 0, 1, 0, ${transformX}, ${transformY}, 0, 1)`, // blurry on safari
    transform: `matrix(${zoom}, 0, 0, ${zoom}, ${translateX}, ${translateY})`,
  };

  return (
    <div className="App">
      <div>
        <button onClick={zoomIn} type="button">
          +
        </button>
        <button onClick={zoomOut} type="button">
          -
        </button>
      </div>
      <div>
        <div id="svg-wrapper">
          {/* <img src={mapSvg} className="map-image" alt="map" style={mapStyles} /> */}
          <div style={mapStyles}>
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
