const customErrors = require("../errors");
const { isTokenValid } = require("../utils");
const User = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
	const token = req.signedCookies.token;
	if (!token) {
		throw new customErrors.UnauthenticatedError("Authentication failed");
	}
	try {
		const { name, userId, role } = isTokenValid({ token });
		res.locals.user = { name, userId, role };
		next();
	} catch (error) {
		throw new customErrors.UnauthenticatedError("Authentication failed");
	}
};

const authorizePermissions = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(res.locals.user.role)) {
			throw new customErrors.UnauthorizedError(
				"Unauthorized to access this route"
			);
		}
		next();
	};
};

module.exports = { authenticateUser, authorizePermissions };
