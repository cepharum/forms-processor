<template>
	<div class="form" v-if="prepared">
		<div class="title">
			<div class="inside">
				<FormTitle/>
			</div>
		</div>
		<div class="progress">
			<div class="inside">
				<FormProgress/>
			</div>
		</div>
		<div class="body">
			<div class="inside">
				<FormContent/>
			</div>
		</div>
		<div class="control">
			<div class="inside">
				<FormControl/>
			</div>
		</div>
	</div>
</template>

<script>
import FormTitle from "./Form/Title";
import FormProgress from "./Form/Progress";
import FormContent from "./Form/Content";
import FormControl from "./Form/Control";

export default {
	name: "Form",
	components: {
		FormTitle,
		FormProgress,
		FormContent,
		FormControl,
	},
	computed: {
		prepared() {
			return this.$store.getters["form/loaded"];
		},
	},
};
</script>
