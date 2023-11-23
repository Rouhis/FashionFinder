import React, { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";


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

export const SelectBoxColor = ({name}) => {

    const [brand, setBrand] = useState("");

    const handleSelectBoxChangeBrand = (event) => {
        setBrand(event.target.value);
        console.log(event.target.value)
      };
    

return(
<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
  <InputLabel id="select-small-label">{name}</InputLabel>
  <Select labelId="select-small-label" id="select-small" label={name} defaultValue={""} onChange={handleSelectBoxChangeBrand}>
    <MenuItem value="">
    <em>None</em>
    </MenuItem>
    <MenuItem value={"ONSE"}>ONSE</MenuItem>
    <MenuItem value={"OSHEE"}>OSHEE</MenuItem>
    <MenuItem value={"4MOVE"}>4MOVE</MenuItem>
  </Select>
</FormControl>
);
};



