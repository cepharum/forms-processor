<template>
	<div class="form-control">
		<button v-if="!isSole" @click="rewind()" :disabled="isFirst">{{
			labelPrevious }}
		</button>
		<button v-if="!isLast" @click="advance()" :disabled="isInvalid">{{
			labelNext }}
		</button>
		<button v-if="isLast" @click="submit()" :disabled="isInvalid">{{
			labelSubmit }}
		</button>
	</div>
</template>

<script>
export default {
	name: "FormControl",
	computed: {
		isSole() {
			return this.$store.getters.sequence.forms.length < 2;
		},
		isFirst() {
			return this.$store.getters.sequence.currentIndex < 1;
		},
		isLast() {
			const manager = this.$store.getters.sequence;

			return manager.currentIndex === manager.forms.length - 1;
		},
		isInvalid() {
			return !this.$store.getters.sequence.currentForm.valid;
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
			return this.$store.getters.sequence.rewind();
		},
		advance() {
			return this.$store.getters.sequence.advance();
		},
		submit() {
			return this.$store.getters.sequence.submit();
		},
	},
};
</script>
