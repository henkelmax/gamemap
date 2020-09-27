<template>
  <v-container>
    <v-dialog persistent scrollable v-model="active" max-width="500">
      <v-card>
        <v-card-title class="headline">Welcome</v-card-title>
        <v-card-text>
          Do you want to join a room or create a room?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="join">Join</v-btn>
          <v-btn text @click="create">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    active: false,
    resolve: null
  }),
  methods: {
    open() {
      this.active = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
      });
    },
    join() {
      this.active = false;
      this.resolve(false);
    },
    create() {
      this.active = false;
      this.resolve(true);
    },
  },
};
</script>
