<template>
	<div class="form-view" :id="sequenceName"
	     ref="view"
	     :class="{result:hasResult, success:hasResultOnSuccess, failure:hasResultOnFailure}"
	     v-global-key.advance="advance"
	     v-global-key.rewind="rewind">
		<div class="title">
			<div class="inside">
				<FormTitle/>
			</div>
		</div>
		<div class="progress" v-if="!hasResultOnSuccess && isVisible.progress !== false">
			<div class="inside">
				<FormProgress/>
			</div>
		</div>
		<div class="body">
			<div class="inside">
				<FormResult/>
				<FormContent v-if="!hasResultOnSuccess"/>
			</div>
		</div>
		<div class="control" v-if="!hasResultOnSuccess">
			<div class="inside">
				<FormControl/>
			</div>
		</div>
	</div>
</template>

<script>
const FormTitle = () => import( /* webpackChunkName: "form" */ "./Form/Title" );
const FormProgress = () => import( /* webpackChunkName: "form" */ "./Form/Progress" );
const FormResult = () => import( /* webpackChunkName: "form" */ "./Form/Result" );
const FormContent = () => import( /* webpackChunkName: "form" */ "./Form/Content" );
const FormControl = () => import( /* webpackChunkName: "form" */ "./Form/Control" );

export default {
	name: "Form",
	components: {
		FormTitle,
		FormProgress,
		FormResult,
		FormContent,
		FormControl,
	},
	computed: {
		isVisible() {
			return ( this.$store.getters["form/sequenceManager"].mode || {} ).view || {};
		},
		hasResult() {
			return this.$store.getters["form/hasResult"];
		},
		hasResultOnSuccess() {
			return this.$store.getters["form/resultIsSuccess"];
		},
		hasResultOnFailure() {
			return this.$store.getters["form/resultIsError"];
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
		scrollToTop() {
			let iter = this.$refs.view;
			let y = 0;

			while ( iter ) {
				y += iter.offsetTop;
				iter = iter.offsetParent;
			}

			window.scrollTo( 0, y );
		},
	},
	beforeMount() {
		this.$store.getters.sequence.events.$on( "sequence:advance", this.scrollToTop );
	},
	beforeDestroy() {
		this.$store.getters.sequence.events.$off( "sequence:advance", this.scrollToTop );
	},
};
</script>
