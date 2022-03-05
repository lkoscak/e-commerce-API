const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors");
const { attachCokiesToResponse, createTokenUser } = require("../utils");
const User = require("../models/userModel");

const register = async (req, res) => {
	const { name, email, password } = req.body;
	const isFirstAccount = (await User.countDocuments({})) === 0;
	const role = isFirstAccount ? "admin" : "user";
	const user = await User.create({ name, email, password, role });
	const tokenUser = createTokenUser(user);
	attachCokiesToResponse({ res, user: tokenUser });
	res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new customErrors.BadRequestError("Please provide login credentials");
	}
	const user = await User.findOne({ email });
	if (!user || !(await user.comparePassword(password))) {
		throw new customErrors.UnauthenticatedError(
			"Please provide valid login credentials"
		);
	}
	const tokenUser = createTokenUser(user);
	attachCokiesToResponse({ res, user: tokenUser });
	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = (req, res) => {
	res.cookie("token", null, { httpOnly: true, expires: new Date(Date.now()) });
	res.status(StatusCodes.OK).send();
};

module.exports = { register, login, logout };
