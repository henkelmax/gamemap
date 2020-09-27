<template>
  <v-container>
    <v-dialog scrollable v-model="active" max-width="500">
      <v-card>
        <v-card-title class="headline">Your ID</v-card-title>
        <v-card-text>
          Your ID is <b id="id">{{ id }}</b></v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="close">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    id: "",
    active: false,
  }),
  methods: {
    open(id) {
      this.id = id;
      this.active = true;
    },
    close() {
      this.active = false;
    },
  },
};
</script>
