import React from "react";
import List from "@mui/joy/List";
import ListItem from "./ListItem";
import PropTypes from "prop-types";

const ListForProducts = ({ mediaArray, material, color}) => {
  console.log("mediaArray in List component", mediaArray, ":DDD", material, color);
  return (
    <List>
      <ListItem mediaArray={mediaArray} material={material} color={color}></ListItem>
    </List>
  );
};

ListForProducts.propTypes = {
  mediaArray: PropTypes.array.isRequired,
  material: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};

export default ListForProducts;
