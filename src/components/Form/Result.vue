<template>
	<div class="result">
		<div class="error" v-if="hasError && message != null" v-html="message"></div>
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

			return message ? md.render( String( message ) ) : null;
		},
	},
	beforeMount() {
		this.unsubscriber = this.$store.subscribe( ( mutation, state ) => {
			if ( mutation.type === "form/result" ) {
				const { result: { event, redirect } } = state.form;

				if ( event ) {
					this.$root.$emit( event.name, event.args, event.data );
				} else if ( redirect ) {
					location.href = redirect;
				}
			}
		} );
	},
	beforeDestroy() {
		this.unsubscriber();
	},
};
</script>
