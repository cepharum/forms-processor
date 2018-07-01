<template>
  <div id="app">
    <div class="header"/>
    <div class="body">
      <router-view/>
    </div>
    <div class="footer"/>
  </div>
</template>

<script>
import Vue from "vue";

let first = true;

export default {
	name: "App",
	created() {
		const store = this.$store;

		store.subscribe( mutation => {
			switch ( mutation.type ) {
				case "selectForm" :
					this.$router.replace( { name: "FormView" } );
					break;

				case "setLocale" :
					if ( first ) {
						this.$router.replace( { name: "Splash" } );
						first = false;
					}
					break;
			}
		} );

		return store.dispatch( "setLocale", navigator.language )
			.then( () => store.dispatch( "selectForm", Vue.config.formId ) );
	},
};
</script>

<style src="./assets/theme.scss" lang="scss"></style>

<style scoped lang="scss">
</style>
