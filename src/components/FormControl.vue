<template>
  <div
    class="form-control"
    v-if="available">
    <FormControlSequence />
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
				resolve( getters.formSequenceManager.renderControlComponent() );
			} else {
				const unsubscribe = store.subscribe( () => {
					if ( getters.hasForm ) {
						unsubscribe();
						resolve( getters.formSequenceManager.renderControlComponent() );
					}
				} );
			}
		} ),
	},
	computed: {
		available() {
			return this.$store.getters.formSequenceManager;
		},
		sequenceLabel() {
			const manager = this.$store.getters.formSequenceManager;

			return manager ? manager.label : "";
		},
		sequenceDescription() {
			const manager = this.$store.getters.formSequenceManager;

			return manager ? manager.description : "";
		},
	},
};
</script>

<style scoped>
</style>
