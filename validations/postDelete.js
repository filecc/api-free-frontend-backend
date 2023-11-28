/**
 * @type {import("express-validator").Schema}
 */

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../lib/CustomError");
const prisma = new PrismaClient();

module.exports = {
  slug: {
    in: ["body"],
    isString: {
      bail: true,
      errorMessage: "Slug must be provided and has to be a string.",
    },
    custom: {
      options: async (value) => {
        await prisma.post
          .findUnique({
            where: {
              slug: value,
            },
          })
          .then((post) => {
            if (!post) {
              throw new Error(`Post with slug '${value}' not found.`, 404);
            }
            return true;
          })
          .catch((error) => {
            throw new CustomError(error, 500 );
          });
      },
    },
  },
};
