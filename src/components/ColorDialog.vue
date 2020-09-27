<template>
  <v-container>
    <v-dialog persistent scrollable v-model="active" max-width="500">
      <v-card>
        <v-card-title class="headline">Choose your color</v-card-title>
        <v-card-text>
          <v-row justify="space-around" align="center">
            <v-color-picker v-model="color" flat></v-color-picker>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="ok">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    active: false,
    resolve: null,
    color: "#FF0000",
  }),
  methods: {
    open(color) {
      this.color = color;
      this.active = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
      });
    },
    ok() {
      this.active = false;
      this.resolve(this.color);
    },
  },
};
</script>
