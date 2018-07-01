<template>
  <div v-if="available" class="form-control">
    <button v-if="!isSole" :disabled="!isFirst">{{ labelPrevious }}</button>
    <button v-if="!isLast">{{ labelNext }}</button>
    <button v-if="isLast">{{ labelSubmit }}</button>
  </div>
</template>

<script>
import Vue from "vue";
import store from "../store";

export default {
	name: "FormView",
	components: {
		FormControlSequence: Vue.component( "FormControlSequence", function( resolve ) {
			const getters = store.getters;

			if ( getters.hasForm ) {
				resolve( getters.formSequenceManager.controlComponent );
			} else {
				const unsubscribe = store.subscribe( () => {
					if ( getters.hasForm ) {
						unsubscribe();
						resolve( getters.formSequenceManager.controlComponent );
					}
				} );
			}
		} ),
	},
	computed: {
		available() {
			return this.$store.getters.formSequenceManager;
		},
		isSole() {
			return this.$store.getters.formSequenceManager.forms.length < 2;
		},
		isFirst() {
			return true;
		},
		isLast() {
			return true;
		},
		labelPrevious() {
			return this.$store.getters.l10n.BUTTONS.PREVIOUS;
		},
		labelNext() {
			return this.$store.getters.l10n.BUTTONS.NEXT;
		},
		labelSubmit() {
			return this.$store.getters.l10n.BUTTONS.SUBMIT;
		},
	},
};
</script>

<style scoped>
</style>
