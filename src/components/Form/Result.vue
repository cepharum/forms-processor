<template>
	<div class="result">
		<div class="error" v-if="hasError" v-html="message"></div>
		<div class="success" v-if="hasSuccess" v-html="message"></div>
	</div>
</template>
<script>
import Markdown from "../../model/form/utility/markdown";

const md = Markdown.getRenderer();

export default {
	name: "FormError",
	computed: {
		hasSuccess() {
			return this.$store.getters["form/resultIsSuccess"];
		},
		hasError() {
			return this.$store.getters["form/resultIsError"];
		},
		message() {
			const message = this.$store.getters["form/resultMessage"];

			return message == null ? "" : md.render( String( message ) );
		},
	},
	beforeMount() {
		this.unsubscriber = this.$store.subscribe( ( mutation, state ) => {
			if ( mutation.type === "form/result" ) {
				const { result } = state.form;

				if ( result.route ) {
					this.$router[result.route.replace ? "replace" : "push"]( result.route );
				} else if ( result.redirect ) {
					location.href = result.redirect;
				}
			}
		} );
	},
	beforeDestroy() {
		this.unsubscriber();
	},
};


</script>
