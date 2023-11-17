import List from "@mui/joy/List";
import ListItem from "./ListItem";
import PropTypes from "prop-types";

const ListForProducts = ({ mediaArray }) => {
  console.log("mediaArray in List component", mediaArray);
  return (
    <List>
      <ListItem mediaArray={mediaArray}></ListItem>
    </List>
  );
};

ListForProducts.propTypes = {
  mediaArray: PropTypes.array.isRequired,
};

export default ListForProducts;
