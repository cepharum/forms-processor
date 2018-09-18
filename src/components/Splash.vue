<template>
	<div class="splash">
		<div v-if="available" class="message">
			<h1>{{splashHeadline}}</h1>
			<p>{{splashExplanation}}</p>
		</div>
		<div v-if="error" class="error">{{error}}</div>
	</div>
</template>

<script>
import Vue from "vue";
import L10n from "@/service/l10n";
import Definition from "@/service/definition";

export default {
	name: "Splash",
	created() {
		Promise.resolve( this.$store.dispatch( "l10n/select" ) )
			.then( () => { // eslint-disable-line consistent-return
				if ( !this.$store.getters["l10n/prepared"] ) {
					const locale = this.$store.getters["l10n/current"];
					return L10n.loadMap( locale )
						.catch( () => {
							console.error( `loading translation for ${locale} failed, using en instead` ); // eslint-disable-line no-console

							return this.$store.dispatch( "l10n/select", "en" )
								.then( L10n.loadMap( this.$store.getters["l10n/current"] ) );
						} );
				}
			} )
			.then( translations => { // eslint-disable-line consistent-return
				if ( translations ) {
					return this.$store.dispatch( "l10n/load", {
						locale: this.$store.getters["l10n/current"],
						translations,
					} );
				}
			} )
			.then( () => Definition.load( this.$root.$options.form.definition ) )
			.then( definition => this.$store.dispatch( "form/define", {
				id: this.$root.$options.form.id,
				definition,
			} ) )
			.then( () => this.$router.replace( {
				name: "ShowForm",
				params: {
					id: Vue.config.formId,
				},
			} ) )
			.catch( error => {
				this.error = `setting up l10n failed: ${error.message}`;
				console.error( this.error ); // eslint-disable-line no-console
			} );
	},
	data() {
		return {
			error: "",
		};
	},
	computed: {
		available() {
			return !this.error && this.$store.getters["l10n/prepared"];
		},
		splashHeadline() {
			return this.$store.getters["l10n/map"].LOADING.WAIT_PROMPT;
		},
		splashExplanation() {
			return this.$store.getters["l10n/map"].LOADING.WAIT_EXPLANATION;
		},
	},
};
</script>

<style scoped>
	.splash {
		display: grid;
		grid-template-columns: 100%;
		grid-template-rows: 100%;
	}
</style>
