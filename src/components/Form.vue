<template>
	<div class="form-view" :id="sequenceName"
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
const FormTitle = () => import( /* webpackChunkName: "form" */ "./Form/Title" );
const FormProgress = () => import( /* webpackChunkName: "form" */ "./Form/Progress" );
const FormContent = () => import( /* webpackChunkName: "form" */ "./Form/Content" );
const FormControl = () => import( /* webpackChunkName: "form" */ "./Form/Control" );

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
