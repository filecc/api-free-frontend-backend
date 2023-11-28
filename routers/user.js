const express = require("express")
const router = express.Router()
const multer = require("multer")
const { checkSchema } = require("express-validator");
const userController = require("../controllers/user")
const userRegister = require("../validations/userRegister");
const userLogin = require("../validations/userLogin");

const doubleMiddlewareRegister = [multer().none(), checkSchema(userRegister)]
const doubleMiddlewareLogin = [multer().none(), checkSchema(userLogin)]

router.post("/register", doubleMiddlewareRegister, userController.register)
router.post("/login", doubleMiddlewareLogin, userController.login)
router.get("/isLogged", userController.isLogged)



module.exports = router