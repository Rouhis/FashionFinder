import React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";

function ListItem({mediaArray, material,color})  {
  //If mediaArray is empty listitem will return null

  if (!mediaArray || !mediaArray.products) {
    return null;
  }

  const productArray = mediaArray.products;
  const cardElements = [];

  for (let i = 0; i < productArray.length; i++) {
    cardElements.push(
      <div className="Card" key={i}>
        <Card orientation="horizontal" className="CardInfo" variant="solid">
          <CardContent>
            <Typography level="title-md" textColor="inherit">
              Name: {productArray[i].name}
            </Typography>
            <Typography level="title-md" textColor="inherit">
              Brand: {productArray[i].brand}
            </Typography>
            <Typography level="title-md" textColor="inherit">
              Price: {productArray[i].price} €
            </Typography>
            <Typography level="title-md" textColor="inherit">
              <a href={`https://en.zalando.de/${productArray[i].sex}/_${color}/?q=${productArray[i].specialName}&upper_material=${material}`}>Link</a>
            </Typography>      
          </CardContent>
        </Card>
      </div>
    );
  }

  return cardElements;
}

export default ListItem;
