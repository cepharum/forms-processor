<script>
export default {
	name: "FormProgress",
	render( createElement ) {
		return createElement( "div", {
			class: "form-progress",
		}, [
			createElement( this.$store.getters.sequence.progressComponent ),
		] );
	},
};
</script>
