<template>
  <div class="splash">
    <h1>{{ splashHeadline }}</h1>
    <p>{{ splashExplanation }}</p>
  </div>
</template>

<script>
export default {
	name: "Splash",
	computed: {
		splashHeadline() {
			return this.$store.getters.l10n.LOADING.WAIT_PROMPT;
		},
		splashExplanation() {
			return this.$store.getters.l10n.LOADING.WAIT_EXPLANATION;
		},
	},
};
</script>

<style scoped>
  .splash {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
  }
</style>
