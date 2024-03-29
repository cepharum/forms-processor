module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
	},
	extends: [
		"plugin:vue/essential",
		"eslint-config-cepharum"
	],
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "error" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
	},
	parserOptions: {
		parser: "babel-eslint"
	}
};
