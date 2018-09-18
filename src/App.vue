<template>
	<div class="forms-client">
		<Splash v-if="showSplash"/>
		<Forms v-if="showForms"/>
	</div>
</template>

<script>
import Splash from "@/components/Splash";
import Forms from "@/components/Form";

export default {
	name: "App",
	components: {
		Splash,
		Forms,
	},
	computed: {
		showSplash() {
			return this.$store.getters.showSplash;
		},
		showForms() {
			return this.$store.getters.showForms;
		},
	},
};
</script>

<style src="./assets/theme.scss" lang="scss"></style>
