<template>
  <v-app>
    <v-main>
      <v-app-bar fixed app>
        <v-toolbar-title class="headline text-uppercase">
          <span>Game Map</span>
        </v-toolbar-title>
        <v-btn text rounded class="ml-4" @click="copyID">Copy ID</v-btn>
        <v-spacer></v-spacer>
        <v-btn text rounded v-if="!!installPrompt" @click="installPWA">
          <v-icon>mdi-download</v-icon>Install
        </v-btn>
        <v-btn text rounded href="https://github.com/henkelmax" target="_blank">
          <v-icon>mdi-open-in-new</v-icon>GitHub
        </v-btn>
      </v-app-bar>
      <Map ref="map" />
      <v-snackbar v-model="snackbar">
        {{ text }}
        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import Map from "./components/Map.vue";

export default {
  name: "App",
  components: {
    Map,
  },
  data: () => ({
    installPrompt: null,
    snackbar: false,
    text: "",
  }),
  beforeCreate() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPrompt = e;
    });
  },
  methods: {
    copyID() {
      this.$clipboard(this.$refs.map.id);
      this.text = "Copied to clipboard";
      this.snackbar = true;
    },
    installPWA() {
      if (!this.installPrompt) {
        return;
      }
      this.installPrompt.prompt();
      this.installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          this.installPrompt = null;
        }
      });
    },
  },
};
</script>

<style>
</style>
