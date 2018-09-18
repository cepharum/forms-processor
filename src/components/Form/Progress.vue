<template>
  <div class="form-progress">
    <FormProgressSequence />
  </div>
</template>

<script>
import Vue from "vue";
import Store from "@/store";

export default {
	name: "FormProgress",
	components: {
		FormProgressSequence: resolve => {
			resolve( Vue.component( "FormProgressSequence", Store.getters.sequence.progressComponent ) );
		},
	},
};
</script>
