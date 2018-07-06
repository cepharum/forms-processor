<template>
  <div v-if="available" class="form-progress">
    <FormProgressSequence />
  </div>
</template>

<script>
import Vue from "vue";
import store from "../store";

export default {
	name: "FormProgress",
	components: {
		FormProgressSequence: Vue.component( "FormProgressSequence", function( resolve ) {
			const getters = store.getters;

			if ( getters.hasForm ) {
				resolve( getters.formSequenceManager.progressComponent );
			} else {
				const unsubscribe = store.subscribe( () => {
					if ( getters.hasForm ) {
						unsubscribe();
						resolve( getters.formSequenceManager.progressComponent );
					}
				} );
			}
		} ),
	},
	computed: {
		available() {
			return this.$store.getters.formSequenceManager;
		},
	},
};
</script>

<style scoped>
</style>
