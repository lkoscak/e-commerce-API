const express = require("express");
const {
	createOrder,
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	updateOrder,
} = require("../controllers/orderController");
const {
	authorizePermissions,
	authenticateUser,
} = require("../middleware/authentication");
const router = express.Router();

router
	.route("/")
	.get(authenticateUser, authorizePermissions("admin"), getAllOrders)
	.post(authenticateUser, createOrder);
router.route("/showMyOrders").get(authenticateUser, getCurrentUserOrders);
router
	.route("/:id")
	.patch(authenticateUser, updateOrder)
	.get(authenticateUser, getSingleOrder);

module.exports = router;
