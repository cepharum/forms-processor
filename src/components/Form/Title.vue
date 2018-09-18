<template>
  <div class="form-title" v-if="sequenceLabel || sequenceDescription">
    <h1 v-if="sequenceLabel">{{ sequenceLabel }}</h1>
    <p v-if="sequenceDescription">{{ sequenceDescription }}</p>
  </div>
</template>

<script>
export default {
	name: "FormTitle",
	computed: {
		sequenceLabel() {
			return this.$store.getters["form/sequenceManager"].label || "";
		},
		sequenceDescription() {
			return this.$store.getters["form/sequenceManager"].description || "";
		},
	},
};
</script>

