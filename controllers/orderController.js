const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors");
const { checkPermissions } = require("../utils");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const fakeStripeAPI = async ({ amount, currency }) => {
	const clientSecret = "somerandomvalue";
	return { clientSecret, amount };
};

const createOrder = async (req, res) => {
	const { items: cartItems, tax, shippingFee } = req.body;
	if (!cartItems || cartItems.length === 0) {
		throw new customErrors.BadRequestError("No cart items provided");
	}
	if (!tax || !shippingFee) {
		throw new customErrors.BadRequestError(
			"Please provide both tax and shipping fee"
		);
	}
	let orderItems = [];
	let subtotal = 0;

	for (const cartItem of cartItems) {
		const dbProduct = await Product.findOne({ _id: cartItem.product });
		if (!dbProduct) {
			throw new customErrors.NotFoundError(
				`No product with id ${cartItem.product}`
			);
		}
		const { name, price, image, _id } = dbProduct;
		const singleOrderItem = {
			amount: cartItem.amount,
			name,
			price,
			image,
			product: _id,
		};
		orderItems.push(singleOrderItem);
		subtotal += singleOrderItem.amount * singleOrderItem.price;
		console.log(orderItems, subtotal);
	}
	const total = tax + shippingFee + subtotal;
	// communicate with stripe to get the client secret (this is a mock - not invoking stripe library)
	const paymentIntent = await fakeStripeAPI({ amount: total, currency: "usd" });
	const order = await Order.create({
		orderItems,
		total,
		subtotal,
		tax,
		shippingFee,
		clientSecret: paymentIntent.clientSecret,
		user: res.locals.user.userId,
	});

	res
		.status(StatusCodes.CREATED)
		.json({ order, clientSecret: order.clientSecret });
};
const getAllOrders = async (req, res) => {
	const orders = await Order.find({});
	res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const order = await Order.findOne({ _id: orderId });
	if (!order) {
		throw new customErrors.NotFoundError(`No order found with id: ${orderId}`);
	}
	checkPermissions(res.locals.user, order.user);
	res.status(StatusCodes.OK).json({ order });
};
const updateOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const { paymentIntentId } = req.body;
	const order = await Order.findOne({ _id: orderId });
	if (!order) {
		throw new customErrors.NotFoundError(`No order found with id: ${orderId}`);
	}
	checkPermissions(res.locals.user, order.user);
	order.paymentIntentId = paymentIntentId;
	order.status = "paid";
	await order.save();
	res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
	const orders = await Order.find({ user: res.locals.user.userId });
	res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

module.exports = {
	createOrder,
	getSingleOrder,
	getAllOrders,
	getCurrentUserOrders,
	updateOrder,
};
