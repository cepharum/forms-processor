// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import API from "./api";
import Store from "./store";

Vue.config.productionTip = false;

API.expose( ( element, options = {} ) => {
	const store = Store();

	return new Vue( {
		el: element,
		store,
		components: { App },
		template: "<App/>",
		form: options,
	} );
} );
