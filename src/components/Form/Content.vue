<template>
  <div class="form-view">
    <FormContentSequence />
  </div>
</template>

<script>
import Vue from "vue";
import Store from "@/store";

export default {
	name: "FormContent",
	components: {
		FormContentSequence: resolve => resolve( Vue.component( "FormContentSequence", Store.getters.sequence.formsComponent ) ),
	},
};
</script>
