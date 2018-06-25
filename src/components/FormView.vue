<template>
  <div
    class="form-view"
    v-if="available">
    <h1>{{ sequenceLabel }}</h1>
    <p>{{ sequenceDescription }}</p>
    <FormSequence />
  </div>
</template>

<script>
import Vue from "vue";
import store from "../store";

export default {
	name: "FormView",
	components: {
		FormSequence: Vue.component( "FormSequence", function( resolve ) {
			const getters = store.getters;

			if ( getters.hasForm ) {
				resolve( getters.formSequenceManager.renderComponent() );
			} else {
				const unsubscribe = store.subscribe( () => {
					if ( getters.hasForm ) {
						unsubscribe();
						resolve( getters.formSequenceManager.renderComponent() );
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
