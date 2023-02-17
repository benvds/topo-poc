import { useCallback, useRef, useState } from "react";
// @ts-ignore
import { ReactComponent as Map } from "./assets/map.svg";
import { useGesture } from "@use-gesture/react";

import "./App.css";

function App() {
  const gestureTargetRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [movementX, setMovementX] = useState(0);
  const [movementY, setMovementY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [pinch, setPinch] = useState(1);

  const zoomIn = useCallback(() => setScale((prev) => prev + 1), [setScale]);
  const zoomOut = useCallback(() => setScale((prev) => prev - 1), [setScale]);

  // Set the drag hook and define component movement based on gesture data
  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my] }) => {
        setDragX(mx);
        setDragY(my);
        // setTranslateX((prev) => prev + mx);
        // setTranslateY((prev) => prev + my);
        // api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down });
      },
      onDragEnd: ({ movement: [mx, my] }) => {
        setDragX(0);
        setDragY(0);
        setMovementX((prev) => prev + mx);
        setMovementY((prev) => prev + my);
      },
      onPinch: ({ offset }) => {
        setPinch(offset[0] / scale);
      },
      onPinchEnd: ({ offset }) => {
        setPinch(1);
        setScale((prev) => {
          console.debug("pinch end", prev * (offset[0] / prev));
          return prev * (offset[0] / prev);
        });
      },
    },
    {
      target: gestureTargetRef,
    }
  );

  const mapStyles = {
    touchAction: "none",
    // transform: `scale(${zoom}, ${zoom})`,
    // transform: `matrix3d(${zoom}, 0, 0, 0, 0, ${zoom}, 0, 0, 0, 0, 1, 0, ${transformX}, ${transformY}, 0, 1)`, // blurry on safari
    transform: `matrix(${scale * pinch}, 0, 0, ${scale * pinch}, ${movementX + dragX
      }, ${movementY + dragY})`,
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
          <div ref={gestureTargetRef} style={mapStyles}>
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
