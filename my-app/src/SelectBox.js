import React, { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useContext, useEffect } from "react";
import AppContext from "./components/hooks/createContext";
import { SliderMark } from "@mui/material";

export const SelectBoxMaterial = ({ name }) => {
  //const { material, setMaterialState } = useContext(AppContext2);

  const {
    material: [material, setMaterial],
  } = useContext(AppContext);


  
    const handleSelectBoxChangeMaterial = (event) => {
        setMaterial(event.target.value);
        console.log("materiaaaliiii", material)
      };
    

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="select-small-label">{name}</InputLabel>
      <Select
        labelId="select-small-label"
        id="select-small"
        label={name}
        onChange={handleSelectBoxChangeMaterial}
        defaultValue={""}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={"Leather"}>Leather</MenuItem>
        <MenuItem value={"Wool"}>Wool</MenuItem>
        <MenuItem value={"Polyester"}>Polyester</MenuItem>
      </Select>
    </FormControl>
  );
};

export const SelectBoxColor = ({ name }) => {
  const {
    color: [color, setColor]
  } = useContext(AppContext);  

    const handleSelectBoxChangeColor = (event) => {
        setColor(event.target.value);
        console.log("väri on   ",color)
      };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="select-small-label">{name}</InputLabel>
      <Select
        labelId="select-small-label"
        id="select-small"
        label={name}
        onChange={handleSelectBoxChangeColor}
        defaultValue={""}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={"Black"}>
          Black
        </MenuItem>
        <MenuItem value={"White"}>White</MenuItem>
        <MenuItem value={"Red"}>Red</MenuItem>
        <MenuItem value={"Yellow"}>Yellow</MenuItem>
        <MenuItem value={"Blue"}>Blue</MenuItem>
      </Select>
    </FormControl>
  );
};
