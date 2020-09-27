<template>
  <v-container>
    <v-dialog persistent scrollable v-model="active" max-width="500">
      <v-card>
        <v-card-title class="headline">Create a new room</v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field
              v-model="name"
              :rules="nameRules"
              :counter="32"
              label="Your Name"
              required
            >
            </v-text-field>
            <v-file-input
              label="Select Map"
              :rules="fileRules"
              v-model="file"
              accept="image/*"
              required
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="back">Back</v-btn>
          <v-btn text :disabled="!valid || !file" @click="cont">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";

export default {
  data: () => ({
    valid: false,
    name: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => v.length >= 3 || "Name must be at least 3 characters",
      (v) => v.length <= 32 || "Name must be 32 characters or less",
      (v) =>
        /^[a-zA-Z ]{3,32}$/.test(v) || "Name must be only letters and spaces",
    ],
    file: null,
    fileRules: [
      (v) => !v || v.size < 10000000 || "Map size should be less than 10 MB",
    ],
    active: false,
    resolve: null,
  }),
  created() {
    this.name = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: "capital",
      separator: " ",
    });
  },
  methods: {
    open(id) {
      this.id = id;
      this.active = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
      });
    },
    cont() {
      this.active = false;
      this.resolve({ name: this.name, file: this.file });
    },
    back() {
      window.location.reload();
    },
  },
};
</script>
