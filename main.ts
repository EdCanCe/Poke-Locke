import Fastify, { FastifyInstance } from "fastify";

// Declares fastify
const app = Fastify({
  logger: true,
});

// Loads the routes
import imageRoute from "./routes/image.routes";
app.register(imageRoute, { prefix: "/image" });

// Run the server
app.listen({ port: Number(process.env.PORT) || 3000 }, function (err) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
