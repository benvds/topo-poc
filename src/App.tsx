import { useCallback, useEffect, useMemo, useRef } from "react";
// @ts-ignore
import svgMap, { ReactComponent as Map } from "./assets/map.svg";
import { useGesture, useDrag } from "@use-gesture/react";
import { useSpring, animated, to } from "@react-spring/web";

import "./App.css";

// a memoize function

const getTransform = (
  wrapper: HTMLDivElement | null,
  content: HTMLDivElement | null
) => {
  if (!wrapper || !content) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }
  const wbounds = wrapper.getBoundingClientRect();
  const cbounds = content.getBoundingClientRect();

  // console.debug("wbounds", wbounds);
  // console.debug("cbounds", cbounds);

  const sw = wbounds.width / cbounds.width;
  const sh = wbounds.height / cbounds.height;
  const sx = -((cbounds.left - wrapper.offsetLeft) / cbounds.width);
  const sy = -((cbounds.top - wrapper.offsetTop) / cbounds.height);

  return {
    x: 100 * sx,
    y: 100 * sy,
    width: 100 * sw,
    height: 100 * sh,
  };
};

const handleZoomChange = () => {
  const transform = getTransform(
    document.querySelector("#svg-wrapper"),
    document.querySelector("#map-container")
  );
  // console.debug("onTransform", transform);

  const el = document.querySelector(".mini-map-overlay");

  if (el) {
    (el as HTMLDivElement).style.setProperty(
      "clip-path",
      `
      polygon(0% 0%, 0% 100%, ${transform.x}% 100%, ${transform.x}% ${transform.y
      }%, ${transform.x + transform.width}% ${transform.y}%, ${transform.x + transform.width
      }% ${transform.y + transform.height}%, ${transform.x}% ${transform.y + transform.height
      }%, ${transform.x}% 100%, 100% 100%, 100% 0%)
      `
    );
  }
};

function App() {
  const gestureTargetRef = useRef(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const svg = useMemo(() => svgMap, []);

  const dragYCache = useRef(0).current;
  const [{ dragX, dragY, zoom }, api] = useSpring(() => ({
    dragX: 0,
    dragY: 0,
    zoom: 1,
  }));

  const zoomDuration = 200;

  const zoomIn = useCallback(() => {
    api.start({ zoom: zoom.get() + 1 });
    setTimeout(handleZoomChange, zoomDuration);
  }, [zoom, api]);
  const zoomOut = useCallback(() => {
    api.start({ zoom: zoom.get() < 2 ? 1 : zoom.get() - 1 });
    setTimeout(handleZoomChange, zoomDuration);
  }, [zoom, api]);

  const getDiff = () => {
    const viewWrapper = document.querySelector("#svg-wrapper");
    const mapContainer = document.querySelector("#map-container");

    if (!viewWrapper || !mapContainer) {
      return 0;
    }

    const viewHeight = viewWrapper.getBoundingClientRect().height;
    const mapHeight = mapContainer.getBoundingClientRect().height;

    if (viewHeight > mapHeight) {
      return 0;
    }

    return mapHeight - viewHeight;
  }

  // clamp offset x within bounds of the wrapper
  const clampY = (offset: number) => {
    const diff = getDiff();
    const tooLow = offset < -1 * diff;
    const tooHigh = offset > 0;

    if (tooLow) {
      return -1 * diff;
    } else if (tooHigh) {
      return 0;
    } else {
      return offset;
    }
  };

  useDrag(({ offset, lastOffset }) => {
        // console.debug("delta", delta);
        console.debug("offset", offset[1]);
        console.debug("lastOffset", lastOffset[1]);
        api.start({
          dragX: zoom.get() > 1 ? offset[0] : dragX.get(),
          dragY: clampY(offset[1]),
          immediate: true,
          onResolve: handleZoomChange,
        });
      }, { target: gestureTargetRef, axis: 'y', from: () => [0, clampY(dragY.get())] });

  useGesture(
    {
      onPinch: ({ offset: [d] }) =>
        api.start({ zoom: d, immediate: true, onResolve: handleZoomChange }),
      onWheel: ({ event: _event, offset: [, y] }) => {
        api.start({
          zoom: 1 + y * -0.01,
          immediate: true,
          onResolve: handleZoomChange,
        });
      },
    },
    {
      target: gestureTargetRef,
    }
  );

  useEffect(handleZoomChange, []);

  return (
    <div className="App">
      <div>
        <div ref={svgWrapperRef} id="svg-wrapper">
          <div className="svg-wrapper-overlay">
            <div className="mini-map">
              <img id="mini-map-canvas" src={svgMap} width="170" height="127" />
              <div className="mini-map-overlay" />
            </div>

            <button onClick={zoomIn} type="button">
              +
            </button>
            <button onClick={zoomOut} type="button">
              -
            </button>
          </div>
          <animated.div
            id="map-container"
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
