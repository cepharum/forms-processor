<template>
  <div v-if="available" class="form-control">
    <button v-if="!isSole" :disabled="!isFirst">{{ labelPrevious }}</button>
    <button v-if="!isLast">{{ labelNext }}</button>
    <button v-if="isLast">{{ labelSubmit }}</button>
  </div>
</template>

<script>
export default {
	name: "FormControl",
	computed: {
		available() {
			return this.$store.getters.hasLocalization && this.$store.getters.formSequenceManager;
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
