const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
	const { product: productId } = req.body;
	const isValidProduct = await Product.findOne({ _id: productId });
	if (!isValidProduct) {
		throw new customErrors.NotFoundError(
			`No product with provided id: ${productId}`
		);
	}
	const alreadySubmitted = await Review.findOne({
		product: productId,
		user: res.locals.user.userId,
	});
	if (alreadySubmitted) {
		throw new customErrors.BadRequestError(
			`Already submitted review for this product`
		);
	}
	req.body.user = res.locals.user.userId;
	const review = await Review.create(req.body);
	res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
	const reviews = await Review.find({})
		.populate({
			path: "product",
			select: "name company price",
		})
		.populate({
			path: "user",
			select: "name",
		});
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId })
		.populate({
			path: "product",
			select: "name company price",
		})
		.populate({
			path: "user",
			select: "name",
		});
	if (!review) {
		throw new customErrors.NotFoundError(
			`No review found with id: ${reviewId}`
		);
	}
	res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const { rating, title, comment } = req.body;
	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new customErrors.NotFoundError(
			`No review found with id: ${reviewId}`
		);
	}
	checkPermissions(res.locals.user, review.user);
	review.rating = rating;
	review.title = title;
	review.comment = comment;
	await review.save();
	res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new customErrors.NotFoundError(
			`No review found with id: ${reviewId}`
		);
	}
	checkPermissions(res.locals.user, review.user);
	review.remove();
	res.status(StatusCodes.OK).json({ msg: "review deleted" });
};
const getSingleProductReviews = async (req, res) => {
	const { id: productId } = req.params;
	const reviews = await Review.find({ product: productId });
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews,
};
