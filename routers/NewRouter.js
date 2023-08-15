const express = require("express");
const router = express.Router();
const { add, getNews } = require("../controllers/NewController");

router.route("/add-new").post(add);
router.route("/news").get(getNews);

module.exports = router;
