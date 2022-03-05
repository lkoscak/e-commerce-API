const express = require("express");
const {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
} = require("../controllers/userController");
const { authorizePermissions } = require("../middleware/authentication");

const router = express.Router();

router.route("/").get(authorizePermissions("admin"), getAllUsers);
router.route("/showMe").get(showCurrentUser); // it is important to put this route before '/:id' route because 'showMe' will be treated as 'id'
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(updateUserPassword);
router.route("/:id").get(getSingleUser);

module.exports = router;
