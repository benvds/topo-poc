import { useCallback, useRef, useState } from "react";
// @ts-ignore
import { ReactComponent as Map } from "./assets/map.svg";
import { useGesture, useDrag } from "@use-gesture/react";
import { useSpring, animated, to } from "@react-spring/web";

import "./App.css";

function App() {
  const gestureTargetRef = useRef(null);

  const [{ dragX, dragY, zoom }, api] = useSpring(() => ({
    dragX: 0,
    dragY: 0,
    zoom: 1,
  }));

  const zoomIn = useCallback(
    () => api.start({ zoom: zoom.get() + 1 }),
    [zoom, api]
  );
  const zoomOut = useCallback(
    () => api.start({ zoom: zoom.get() < 2 ? 1 : zoom.get() - 1 }),
    [zoom, api]
  );

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) =>
        api.start({
          // keep dragging within bounds, only for zoom 1 for now...
          dragX: zoom.get() > 1 ? x : dragX.get(),
          dragY: zoom.get() > 1 ? y : dragY.get(),
          immediate: true,
        }),
      onPinch: ({ offset: [d] }) => api.start({ zoom: d, immediate: true }),
      onWheel: ({ event: _event, offset: [, y] }) =>
        api.start({ zoom: 1 + y * -0.01, immediate: true }),
    },
    {
      target: gestureTargetRef,
    }
  );

  return (
    <div className="App">
      <div>
        <div id="svg-wrapper">
          <div className="svg-wrapper-overlay">
            <button onClick={zoomIn} type="button">
              +
            </button>
            <button onClick={zoomOut} type="button">
              -
            </button>
          </div>
          <animated.div
            ref={gestureTargetRef}
            style={{
              translateX: dragX,
              translateY: dragY,
              scale: zoom,
              touchAction: "none",
            }}
          >
            <Map />
          </animated.div>
        </div>
      </div>
    </div>
  );
}

export default App;
