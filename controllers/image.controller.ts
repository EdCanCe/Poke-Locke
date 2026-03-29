import { FastifyRequest, FastifyReply } from "fastify";
import { createCanvas, registerFont, loadImage } from "canvas";

registerFont("./assets/fonts/pokemon.ttf", {
  family: "Pokemon",
});

// Creates the image
export const createImage = async (
  request: FastifyRequest<{ Params: { data: string } }>,
  reply: FastifyReply,
) => {
  // Gets the data from the parameters
  const data: String = request.params.data;
  const [pokemon, name, shiny, artwork, innerColor, outerColor] =
    data.split("_");
  let text = name;

  // Verifies if the sprite is shiny or an artwork
  const isShiny = shiny == "shiny";
  const isArtwork = artwork == "artwork";

  // Creates the 2d canvas
  const imgSize = 400;
  const canvas = createCanvas(imgSize, imgSize);
  const ctx = canvas.getContext("2d");
  //ctx.fillStyle = "black";
  //ctx.fillRect(0, 0, imgSize, imgSize);
  // Transparent background
  ctx.clearRect(0, 0, imgSize, imgSize);

  // Makes the font small in case ot overflows
  let fontSize = 80;
  do {
    ctx.font = `${fontSize}px pokemon`;
    const metrics = ctx.measureText(text);
    if (metrics.width <= imgSize) break;
    fontSize -= 2;
  } while (fontSize > 10);

  // Establishes text config
  ctx.fillStyle = `#${innerColor}`;
  ctx.strokeStyle = `#${outerColor}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = fontSize / 10;

  // Obtains and draws the pokemon sprite
  await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      // Returns as JSON
      return result.json();
    })
    .then(async (data) => {
      // Obtains the sprite URL
      let sprite: string = "";

      // Selects the sprite according to the querie
      if (isArtwork) {
        sprite = isShiny
          ? data.sprites.other?.["official-artwork"]?.front_shiny
          : data.sprites.other?.["official-artwork"]?.front_default;
      } else {
        ctx.imageSmoothingEnabled = false;
        sprite = isShiny
          ? data.sprites.front_shiny
          : data.sprites.front_default;
      }

      // Obtains the sprite
      const image = await loadImage(sprite);

      // Draws the sprite
      ctx.drawImage(image, 0, 0, imgSize, imgSize);
    })
    .catch((err) => {
      // Shows an error message
      ctx.font = "120px Pokemon";
      text = "ERROR";
    });

  // Draws the text
  ctx.strokeText(text, imgSize / 2, (imgSize * 4) / 5);
  ctx.fillText(text, imgSize / 2, (imgSize * 4) / 5);

  // Converts to buffer
  //const buffer = canvas.toBuffer("image/png");

  // Sends as image
  reply
    .status(200)
    .header("Content-Type", "image/png")
    .header("Cache-Control", "no-cache, no-store, must-revalidate")
    .send(canvas.toBuffer("image/png"));
};

// Shows the image with transparent background
export const showImage = async (
  request: FastifyRequest<{ Params: { data: string } }>,
  reply: FastifyReply,
) => {
  const data = request.params.data;

  reply.type("text/html").send(`
    <html>
      <body style="margin:0;background:transparent;">
        <img src="${process.env.BASE_URL}/image/create/${data}" />
      </body>
    </html>
  `);
};
