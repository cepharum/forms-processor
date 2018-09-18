<script>
export default {
	name: "FormContent",
	render( createElement ) {
		return createElement( "div", {
			class: "form-view",
		}, [
			createElement( this.$store.getters.sequence.formsComponent ),
		] );
	},
};
</script>
