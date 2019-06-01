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
		<div class="progress" v-if="isVisible.progress !== false">
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
		<div class="blocker" v-if="blocked" @click.capture.prevent.stop="block">{{ $store.getters.l10n.BLOCK_MESSAGE || "Please wait ..." }}</div>
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
	data() {
		return {
			blocked: false,
		};
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
		blockView() {
			this.blocked = true;
		},
		unblockView() {
			this.blocked = false;
		},
		block() {}, // eslint-disable-line no-empty-function
	},
	beforeMount() {
		this.$store.getters.sequence.events.$on( "sequence:advance", this.scrollToTop );
		this.$store.getters.sequence.events.$on( "sequence:submission:start", this.blockView );
		this.$store.getters.sequence.events.$on( "sequence:submission:done", this.unblockView );
		this.$store.getters.sequence.events.$on( "sequence:submission:failed", this.unblockView );
	},
	beforeDestroy() {
		this.$store.getters.sequence.events.$off( "sequence:advance", this.scrollToTop );
		this.$store.getters.sequence.events.$off( "sequence:submission:start", this.blockView );
		this.$store.getters.sequence.events.$off( "sequence:submission:done", this.unblockView );
		this.$store.getters.sequence.events.$off( "sequence:submission:failed", this.unblockView );
	},
};
</script>
