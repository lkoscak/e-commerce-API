const express = require("express");
const {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadProductImage,
} = require("../controllers/productController");
const {
	authorizePermissions,
	authenticateUser,
} = require("../middleware/authentication");
const { getSingleProductReviews } = require("../controllers/reviewController");

const router = express.Router();

router
	.route("/")
	.post([authenticateUser, authorizePermissions("admin")], createProduct)
	.get(getAllProducts);
router
	.route("/uploadImage")
	.post([authenticateUser, authorizePermissions("admin")], uploadProductImage);
router
	.route("/:id")
	.get(getSingleProduct)
	.patch([authenticateUser, authorizePermissions("admin")], updateProduct)
	.delete([authenticateUser, authorizePermissions("admin")], deleteProduct);
router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
