const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_LIFETIME,
	});
	return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCokiesToResponse = ({ res, user }) => {
	const token = createJWT({ payload: user });
	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		signed: true,
		expiresIn: new Date(Date.now() + 24 * 3600 * 1000),
	});
};

module.exports = { createJWT, isTokenValid, attachCokiesToResponse };
