<template>
  <div v-if="available" class="form-control">
    <button v-if="!isSole" @click="rewind()" :disabled="isFirst">{{ labelPrevious }}</button>
    <button v-if="!isLast" @click="advance()">{{ labelNext }}</button>
    <button v-if="isLast" @click="submit()">{{ labelSubmit }}</button>
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
			return this.$store.getters.formSequenceManager.currentIndex < 1;
		},
		isLast() {
			const manager = this.$store.getters.formSequenceManager;

			return manager.currentIndex === manager.forms.length - 1;
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
	methods: {
	    rewind() {
		    return this.$store.getters.formSequenceManager.rewind();
	    },
	    advance() {
		    return this.$store.getters.formSequenceManager.advance();
	    },
	    submit() {
		    return this.$store.getters.formSequenceManager.submit();
	    },
	},
};
</script>

<style scoped>
</style>
