<template>
  <div
    class="form-progress"
    v-if="available">
    <FormProgressSequence />
  </div>
</template>

<script>
import Vue from "vue";
import store from "../store";

export default {
	name: "FormView",
	components: {
		FormProgressSequence: Vue.component( "FormProgressSequence", function( resolve ) {
			const getters = store.getters;

			if ( getters.hasForm ) {
				resolve( getters.formSequenceManager.renderProgressComponent() );
			} else {
				const unsubscribe = store.subscribe( () => {
					if ( getters.hasForm ) {
						unsubscribe();
						resolve( getters.formSequenceManager.renderProgressComponent() );
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
