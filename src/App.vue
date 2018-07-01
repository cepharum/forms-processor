<template>
  <div id="app">
    <div class="title">
      <div class="inside">
        <router-view name="title"/>
      </div>
    </div>
    <div class="progress">
      <div class="inside">
        <router-view name="progress"/>
      </div>
    </div>
    <div class="body">
      <div class="inside">
        <router-view name="body"/>
      </div>
    </div>
    <div class="control">
      <div class="inside">
        <router-view name="control"/>
      </div>
    </div>
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
