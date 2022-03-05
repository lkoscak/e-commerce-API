const { StatusCodes } = require("http-status-codes");
const path = require("path");
const customErrors = require("../errors");
const Product = require("../models/productModel");

const createProduct = async (req, res) => {
	const product = await Product.create({
		...req.body,
		user: res.locals.user.userId,
	});
	res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
	const products = await Product.find({});
	res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOne({ _id: productId }).populate({
		path: "reviews",
	});
	if (!product) {
		throw new customErrors.NotFoundError(
			`No product found with id: ${productId}`
		);
	}
	res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
		new: true,
		runValidators: true,
	});
	if (!product) {
		throw new customErrors.NotFoundError(
			`No product found with id: ${productId}`
		);
	}
	res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
	const { id: productId } = req.params;
	const product = await Product.findOne({ _id: productId });
	if (!product) {
		throw new customErrors.NotFoundError(
			`No product found with id: ${productId}`
		);
	}
	await product.remove(); // use it instead of findOneAndDelete to utilize pre remove hook and delete all reviews (children)
	res
		.status(StatusCodes.OK)
		.json({ msg: `Product with id: ${productId} successfully removed` });
};

const uploadProductImage = async (req, res) => {
	if (!req.files) {
		throw new customErrors.BadRequestError("No file attached");
	}
	const productImage = req.files.image;
	if (!productImage.mimetype.startsWith("image")) {
		throw new customErrors.BadRequestError(
			"File type not supported. Please upload an image"
		);
	}
	const maxSize = 1024 * 1024;
	if (!productImage.size > maxSize) {
		throw new customErrors.BadRequestError("Please upload an image under 1MB ");
	}
	const imagePath = path.join(
		__dirname,
		"../public/uploads/" + `${productImage.name}`
	);
	await productImage.mv(imagePath);
	res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadProductImage,
};
