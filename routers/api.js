const express = require("express")
const router = express.Router()
const apiController = require("../controllers/api")
const multer = require("multer")
const authMiddleware = require("../middleware/auth");
const { checkSchema } = require("express-validator");
const postCreate = require("../validations/postCreate");
const postEdit = require("../validations/postEdit");
const postDelete = require("../validations/postDelete");

const authMulterCreateMiddlware = [multer({dest: "public/images"}).single("image"), authMiddleware, checkSchema(postCreate)]
const authMulterEditMiddleware = [multer().none(), authMiddleware, checkSchema(postEdit)]
const authMulterDeleteMiddleware = [multer().none(), authMiddleware, checkSchema(postDelete)]

router.get("/posts", apiController.index)
router.post("/post", authMulterCreateMiddlware, apiController.store)
router.post("/delete", authMulterDeleteMiddleware, apiController.destroy)
router.get("/post/:slug", apiController.show)
router.post("/edit", authMulterEditMiddleware, apiController.edit)






module.exports = router