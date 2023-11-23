import React, { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useContext, useEffect } from "react";


export const SelectBoxMaterial = ({name}) => {

    const [material, setMaterial] = useState("");

    const handleSelectBoxChangeMaterial = (event) => {
        setMaterial(event.target.value);
        console.log(event.target.value)
      };
    

return(
<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
  <InputLabel id="select-small-label">{name}</InputLabel>
  <Select labelId="select-small-label" id="select-small" label={name} defaultValue={""} onChange={handleSelectBoxChangeMaterial}>
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

export default SelectBoxMaterial

export const SelectBoxColor = ({name}) => {

    const [color, setColor] = useState("");

    const handleSelectBoxChangeBrand = (event) => {
        setColor(event.target.value);
        console.log(event.target.value)
      };
      useEffect(()=>{
        console.log("perserfe", color)
      },[color])

return(
<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
  <InputLabel id="select-small-label">{name}</InputLabel>
  <Select labelId="select-small-label" id="select-small" label={name} defaultValue={""} onChange={handleSelectBoxChangeBrand}>
    <MenuItem value="">
    <em>None</em>
    </MenuItem>
    <MenuItem value={"Black"} onClick={() => setColor("Black")}>Black</MenuItem>
    <MenuItem value={"White"}>White</MenuItem>
    <MenuItem value={"Red"}>Red</MenuItem>
    <MenuItem value={"Yellow"}>Yellow</MenuItem>
    <MenuItem value={"Blue"}>Blue</MenuItem>
  </Select>
</FormControl>
);
};



