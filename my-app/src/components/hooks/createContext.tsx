// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { createContext } from "react";
import { modelInputProps } from "../helpers/Interfaces";

/**
 * All the state variable that we want to use globally through the app context
 */
interface contextProps {
  clicks: [
    clicks: modelInputProps[] | null,
    setClicks: (e: modelInputProps[] | null) => void
  ];
  image: [
    image: HTMLImageElement | null,
    setImage: (e: HTMLImageElement | null) => void
  ];
  maskImg: [
    maskImg: HTMLImageElement | null,
    setMaskImg: (e: HTMLImageElement | null) => void
  ];
  maskedImg: [
    maskedImg: HTMLImageElement | null,
    setMaskedImg: (e: HTMLImageElement | null) => void
  ];
  material: [
    material: String | null,
    setMaterial: (e: String | null)=> void
  ]
  color: [
    color: String | null,
    setColor: (e: String | null)=> void
  ]
}

/**
 * App context with the state variables as contextProps
 */
const AppContext = createContext<contextProps | null>(null);

export default AppContext;
