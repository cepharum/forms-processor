<template>
  <div v-if="available" class="form-view">
    <h1>{{ sequenceLabel }}</h1>
    <p>{{ sequenceDescription }}</p>
  </div>
</template>

<script>
export default {
	name: "FormTitle",
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
