<template>
	<div class="form-control">
		<button v-if="!isSole" @click="rewind()" :disabled="isFirst" class="previous">{{
			labelPrevious }}
		</button>
		<button v-if="!isLast" @click="advance()" :disabled="isInvalid && disable" :class="{next:true, disabled:isInvalid}">{{
			labelNext }}
		</button>
		<button v-if="isLast" @click="submit()" :disabled="isInvalid && disable" :class="{submit:true, disabled:isInvalid}">{{
			labelSubmit }}
		</button>
	</div>
</template>

<script>
export default {
	name: "FormControl",
	computed: {
		disable() {
			return Boolean( this.$root.$options.form.disableButtons );
		},
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
			return !this.$store.getters.sequence.currentForm.readValidState( { live: false, includePristine: true, showErrors: false } );
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
			return this.$store.getters.sequence.submit()
				.then( status => {
					this.$store.dispatch( "form/result", {
						success: true,
						redirect: status.redirect,
						text: status.text,
					} );
				} )
				.catch( error => {
					this.$store.dispatch( "form/result", {
						success: false,
						redirect: error.redirect,
						text: error.text,
						error: error.message,
					} );
				} );
		},
	},
};
</script>
