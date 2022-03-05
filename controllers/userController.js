const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors");
const User = require("../models/userModel");
const {
	createTokenUser,
	attachCokiesToResponse,
	checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
	const users = await User.find({ role: "user" }).select("-password");
	res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getSingleUser = async (req, res) => {
	const { id: userId } = req.params;
	const user = await User.findOne({ _id: userId }).select("name email role");
	if (!user) {
		throw new customErrors.NotFoundError(
			`No user found for provided id: ${userId}`
		);
	}
	checkPermissions(res.locals.user, user._id);
	res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: res.locals.user });
};

const updateUser = async (req, res) => {
	const { name, email } = req.body;
	if (!name || !email) {
		throw new customErrors.BadRequestError("Please provide all values");
	}
	const user = await User.findOneAndUpdate(
		{ _id: res.locals.user.userId },
		{ email, name },
		{ new: true, runValidators: true }
	);
	const tokenUser = createTokenUser(user);
	attachCokiesToResponse({ res, user: tokenUser });
	res.status(StatusCodes.OK).json({ user: tokenUser });
};

//update user with user.save() - pre 'save' hook is triggered
// in hook this.modifiedPaths can be accessed (fields that are modified), this.isModified('password') -> if not then skip hashing
// must be set for every field updated if hook does some stuff on fields that do not need to be updated
/* const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
}; */

const updateUserPassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		throw new customErrors.BadRequestError(
			"Please provide both old and new password"
		);
	}
	const user = await User.findOne({ _id: res.locals.user.userId });
	if (!(await user.comparePassword(oldPassword))) {
		throw new customErrors.UnauthenticatedError("Old password not valid");
	}
	user.password = newPassword;
	await user.save();
	res.status(StatusCodes.OK).send();
};

module.exports = {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
};
