import Vue from "vue";
import Router from "vue-router";

import Splash from "@/components/Splash";
import FormTitle from "@/components/FormTitle";
import FormProgress from "@/components/FormProgress";
import FormView from "@/components/FormView";
import FormControl from "@/components/FormControl";

Vue.use( Router );

export default new Router( {
	routes: [
		{
			path: "/splash",
			name: "Splash",
			components: {
				body: Splash,
			},
		},
		{
			path: "/form",
			name: "FormView",
			components: {
				title: FormTitle,
				progress: FormProgress,
				body: FormView,
				control: FormControl,
			},
		},
	],
} );
