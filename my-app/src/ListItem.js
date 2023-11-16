import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import testjacket from "./jacket.png";

function ListItem({ mediaArray: mediaArray }) {
  //If mediaArray is empty listitem will return null

  if (!mediaArray || !mediaArray.products) {
        console.log("Tyhjääääääääääääääääääää", mediaArray);
    return null;
  }

  const productArray = mediaArray.products;
  const cardElements = [];

  for (let i = 0; i < productArray.length; i++) {
    console.log("Single item in mediaArray ", mediaArray.products[i]);
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
              <a href={productArray[i].urlpage}>Link</a> 
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return cardElements;
}

export default ListItem;
