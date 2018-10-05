<template>
	<div class="form" :id="sequenceName"
	     v-global-key.advance="advance"
	     v-global-key.rewind="rewind">
		<div class="title">
			<div class="inside">
				<FormTitle/>
			</div>
		</div>
		<div class="progress" v-if="isVisible.progress !== false">
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
		isVisible() {
			return ( this.$store.getters["form/sequenceManager"].mode || {} ).view || {};
		},
		sequenceName() {
			return this.$store.getters["form/sequenceManager"].name || "";
		},
	},
	methods: {
		advance() {
			this.$store.getters["form/sequenceManager"].advance();
		},
		rewind() {
			this.$store.getters["form/sequenceManager"].rewind();
		},
	}
};
</script>
