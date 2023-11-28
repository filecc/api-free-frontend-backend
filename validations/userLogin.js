

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @type {import("express-validator").Schema}
 */
module.exports = {
  email: {
    in: ["body"],
    isLength: {
        options: { min: 1 },
        errorMessage: "Email missing.",
        bail: true,
    },
    isEmail: {
        errorMessage: "Not a valid email."
    }},
  password: {
    in: ["body"],
    isLength: {
      options: { min: 1 },
      errorMessage: "Password missing.",
    }
  }
};
