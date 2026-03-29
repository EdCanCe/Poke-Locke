import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";

import { createImage, showImage } from "../controllers/image.controller";

const router: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) => {
  fastify.get("/create/:data", createImage);

  fastify.get("/show/:data", showImage);
};

export default router;
