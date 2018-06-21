import Vue from "vue";
import Router from "vue-router";
import Splash from "@/components/Splash";
import FormView from "@/components/FormView";

Vue.use( Router );

export default new Router( {
	routes: [
		{
			path: "/splash",
			name: "Splash",
			component: Splash,
		},
		{
			path: "/form",
			name: "FormView",
			component: FormView,
		},
	],
} );
