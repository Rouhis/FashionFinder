// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext, useEffect, useState } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps, modelInputProps } from "./helpers/Interfaces";
import * as _ from "underscore";

/**
 * Custom component that handles the resizing and rendering of the uploaded image.
 * @param handleMouseMove Tool takes handleMouseMove function as a prop
 * @returns returns a custom component with the rendered image and a predicted mask on top of the image
 */
const Tool = ({ handleMouseMove }: ToolProps) => {
  const {
    clicks: [clicks],
    image: [image],
    maskImg: [maskImg, setMaskImg],
    maskedImg: [, setMaskedImg],
  } = useContext(AppContext)!;

  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  /**
   * Determine if we should shrink or grow the images to match the
   * width or the height of the page.
   */
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  /**
   * Observer that monitors changes in the size of the page.
   */
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

  /**
   * Send a fetch request to the backend, that creates a mask from the given x and y coordinates. 
   * Saves the image to the data folder
   * @param click details of the click, the x and y coordinate values are gotten from the click parameter
   */
  const onMaskClick = async (click: modelInputProps[]) => {
    console.log("clicks:", click[0])
    const xcoord = click[0].x
    const ycoord = click[0].y
    try {
      const fetched_value = await fetch(`http://localhost:8080/mask/${xcoord}/${ycoord}`)
      const data = await fetched_value.json();
      console.log("fetched value", fetched_value)
      console.log("fetched value in json", data)
    } catch (e) {
      console.log("Server error:", e)
    }
    const timeStamp = new Date().getTime() // Create a new timestamp using the current time
    const img = new Image() // Create a new Image element
    // Put the image path with timestamp as the image source
    // This is done to prevent the browser from caching the image
    img.src = `./assets/data/mask.png?t=${timeStamp}`
    setMaskedImg(img) // Use app context's state variable to save the image and use it in App.js
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
