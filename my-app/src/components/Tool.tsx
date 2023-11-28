// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext, useEffect, useState } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps, modelInputProps } from "./helpers/Interfaces";
import * as _ from "underscore";

const Tool = ({ handleMouseMove }: ToolProps) => {
  const {
    clicks: [clicks],
    image: [image],
    maskImg: [maskImg, setMaskImg],
    maskedImg: [, setMaskedImg],
  } = useContext(AppContext)!;

  // Determine if we should shrink or grow the images to match the
  // width or the height of the page and setup a ResizeObserver to
  // monitor changes in the size of the page
  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });
  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);

  const imageClasses = "";
  const maskImageClasses = `absolute opacity-40 pointer-events-none`;

  const onMaskClick = async (click: modelInputProps[]) => {
    console.log("clicks:", click[0])
    const xcoord = click[0].x
    const ycoord = click[0].y
    try {
      const fetched_value = await fetch(`http://localhost:5000/mask/${xcoord}/${ycoord}`)
      const data = await fetched_value.json();
      console.log("fetched value", fetched_value)
      console.log("fetched value in json", data)
    } catch (e) {
      console.log("Server error:", e)
    }
    const timeStamp = new Date().getTime()
    const img = new Image()
    img.src = `./assets/data/mask.png?t=${timeStamp}`
    setMaskedImg(img)
  }

  // Render the image and the predicted mask image on top
  return (
    <>
      {image && (
        <img
          onMouseMove={handleMouseMove}
          onMouseOut={() => _.defer(() => setMaskImg(null))}
          onTouchStart={handleMouseMove}
          src={image.src}
          className={`${shouldFitToWidth ? "w-full" : "h-full"
            } ${imageClasses}`}
          onClick={() => onMaskClick(clicks)}
        ></img>
      )}
      {maskImg && (
        <img
          src={maskImg.src}
          className={`${shouldFitToWidth ? "w-full" : "h-full"
            } ${maskImageClasses}`}
        ></img>
      )}
    </>
  );
};

export default Tool;
