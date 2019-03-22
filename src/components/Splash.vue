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

import FormFieldAbstractModel from "../model/form/field/abstract";
import FormProcessorAbstractModel from "../model/form/processor/abstract";

import AppInfo from "../../package";

export default {
	name: "Splash",
	created() {
		console.debug( `forms-processor ${AppInfo.version}` ); // eslint-disable-line no-console

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
			.catch( error => {
				this.error = [error.message];

				if ( process.env.NODE_ENV === "development" ) {
					this.stack = error.stack;
				}

				console.error( this.error ); // eslint-disable-line no-console
			} )
			// wait a sec so the splash has a chance to appear ...
			.then( () => new Promise( resolve => setTimeout( resolve, 100 ) ) )
			.then( () => {
				const store = this.$store;
				const { dependencies } = configuration;

				if ( typeof dependencies === "function" ) {
					return dependencies.call( {
						addField( name, field, baseField = null ) {
							const baseClass = baseField == null ? FormFieldAbstractModel : configuration.registry.fields[baseField];
							if ( baseClass == null ) {
								throw new TypeError( `missing base class for deriving new field type implementation` );
							}

							const _field = typeof field === "function" && !FormFieldAbstractModel.isBaseClassOf( field ) ? field( baseClass ) : field;

							if ( FormFieldAbstractModel.isBaseClassOf( _field ) ) {
								configuration.registry.fields[name] = _field;
							} else {
								throw new TypeError( `registering invalid field type as ${name} rejected` );
							}
						},
						addProcessor( name, processor, baseProcessor = null ) {
							const baseClass = baseProcessor == null ? FormProcessorAbstractModel : configuration.registry.processors[baseProcessor];
							if ( baseClass == null ) {
								throw new TypeError( `missing base class for deriving new processor type implementation` );
							}

							const _processor = typeof processor === "function" && !FormProcessorAbstractModel.isBaseClassOf( processor ) ? processor( baseClass ) : processor;

							if ( FormProcessorAbstractModel.isBaseClassOf( _processor ) ) {
								configuration.registry.processors[name] = _processor;
							} else {
								throw new TypeError( `registering invalid processor type as ${name} rejected` );
							}
						},
						addTranslations( locale, translationsOverlay ) {
							const currentLocale = store.getters["l10n/current"];
							if ( locale === currentLocale ) {
								const translations = store.getters["l10n/map"];
								const translationsWithOverlay = Data.deepMerge( translations, translationsOverlay );

								return store.dispatch( "l10n/load", {
									locale: currentLocale,
									translations: translationsWithOverlay,
								} );
							}

							return undefined;
						},
					} );
				}

				return dependencies;
			} )
			.then( () => Definition.load( configuration.definition ) )
			.then( definition => this.$store.dispatch( "form/define", {
				id: configuration.id,
				name: configuration.name,
				definition,
				registry: configuration.registry,
				events: this.$root,
			} ) )
			.then( () => {
				const { onReady } = configuration;

				if ( typeof onReady === "function" ) {
					return onReady.call( this.$store.getters["form/sequenceManager"] );
				}

				return undefined;
			} )
			.then( () => this.$store.dispatch( "switchView", "forms" ) )
			.catch( error => {
				this.error = [error.message];

				if ( process.env.NODE_ENV === "development" ) {
					this.stack = error.stack;
				}

				const { onError } = configuration;

				if ( typeof onError === "function" ) {
					onError( error );
				} else {
					console.error( this.error ); // eslint-disable-line no-console
				}
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
