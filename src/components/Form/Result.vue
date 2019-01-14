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
				if ( state.form.result.redirect ) {
					location.href = state.form.result.redirect;
				}
			}
		} );
	},
	beforeDestroy() {
		this.unsubscriber();
	},
};


</script>
