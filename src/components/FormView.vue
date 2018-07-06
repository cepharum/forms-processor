<template>
  <div v-if="available" class="form-view">
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
				resolve( getters.formSequenceManager.formsComponent );
			} else {
				const unsubscribe = store.subscribe( () => {
					if ( getters.hasForm ) {
						unsubscribe();
						resolve( getters.formSequenceManager.formsComponent );
					}
				} );
			}
		} ),
	},
	computed: {
		available() {
			return this.$store.getters.hasLocalization && this.$store.getters.formSequenceManager;
		},
	},
};
</script>

<style scoped>
</style>
