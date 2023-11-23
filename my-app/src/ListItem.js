import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";

function ListItem({mediaArray, material,color,price}) {
  //If mediaArray is empty listitem will return null
  console.log("Väri ja materiaalii LISTITEMISSÄ", material, color,price)

  if (!mediaArray || !mediaArray.products) {
        console.log("MediaArray is empty", mediaArray);
    return null;
  }

  const productArray = mediaArray.products;
  const cardElements = [];

  for (let i = 0; i < productArray.length; i++) {
    console.log("Single item in mediaArray ", mediaArray.products[i]);
    cardElements.push(
      <div className="Card" key={i}>
        <Card orientation="horizontal" className="CardInfo" variant="outlined" color="neutral">
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
              <a href={`https://en.zalando.de/${productArray[i].sex}/_${color}/?q=${productArray[i].specialName}&price_to=${price}&upper_material=${material}`}>Link</a>
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return cardElements;
}

export default ListItem;
