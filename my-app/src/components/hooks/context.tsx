// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useState } from "react";
import { modelInputProps } from "../helpers/Interfaces";
import AppContext from "./createContext";

/**
 * App context with global state variables. Global variables can only be used in this element's children
 * @param props Global state variables
 * @returns App context with state variables
 */
const AppContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [maskedImg, setMaskedImg] = useState<HTMLImageElement | null>(null);
  const [material, setMaterial] = useState<String | null>(null)
  const [color, setColor] = useState<String | null>(null)

  return (
    <AppContext.Provider
      value={{
        clicks: [clicks, setClicks],
        image: [image, setImage],
        maskImg: [maskImg, setMaskImg],
        maskedImg: [maskedImg, setMaskedImg],
        material: [material, setMaterial],
        color: [color, setColor]
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
