<template>
	<div class="splash">
		<div v-if="available" class="message">
			<h1>{{splashHeadline}}</h1>
			<p>{{splashExplanation}}</p>
		</div>
		<div v-if="error" class="error">
			<p>Failed starting forms processor:</p>
			<p>{{error}}</p>
			<pre v-if="stack">{{stack}}</pre>
		</div>
	</div>
</template>

<script>
import L10n from "@/service/l10n";
import Definition from "@/service/definition";
import Data from "@/service/data";

export default {
	name: "Splash",
	created() {
		const configuration = this.$root.$options.form;

		Promise.resolve( this.$store.dispatch( "l10n/select" ) )
			.then( () => { // eslint-disable-line consistent-return
				if ( !this.$store.getters["l10n/prepared"] ) {
					const locale = this.$store.getters["l10n/current"];
					return L10n.loadMap( locale )
						.catch( () => {
							console.error( `Loading translation for ${locale} failed, using en instead.` ); // eslint-disable-line no-console

							return this.$store.dispatch( "l10n/select", "en" )
								.then( L10n.loadMap( this.$store.getters["l10n/current"] ) );
						} );
				}
			} )
			.then( translations => { // eslint-disable-line consistent-return
				const locale = this.$store.getters["l10n/current"];

				const overlay = ( configuration.registry.translations || {} )[locale];
				const _translations = overlay ? Data.deepMerge( translations || {}, overlay ) : translations || {};

				return this.$store.dispatch( "l10n/load", {
					locale,
					translations: _translations,
				} );
			} )
			.then( () => Promise.all( [
				Definition.load( configuration.definition ),
				configuration.splashDeferral
			] ) )
			.then( ( [definition] ) => this.$store.dispatch( "form/define", {
				id: this.$root.$options.form.id,
				definition,
				registry: configuration.registry,
			} ) )
			.then( () => this.$store.dispatch( "switchView", "forms" ) )
			.catch( error => {
				this.error = [error.message];

				if ( process.env.NODE_ENV === "development" ) {
					this.stack = error.stack;
				}

				console.error( this.error ); // eslint-disable-line no-console
			} );
	},
	data() {
		return {
			error: "",
			stack: "",
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

<style scoped lang="scss">
	pre {
		max-width: 100vh;
		position: relative;
		overflow-x: auto;
		text-align: left;
	}
</style>
