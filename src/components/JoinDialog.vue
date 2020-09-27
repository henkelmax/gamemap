<template>
  <v-container>
    <v-dialog persistent scrollable v-model="active" max-width="500">
      <v-card>
        <v-card-title class="headline">Join a room</v-card-title>
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
            <v-text-field
              v-model="id"
              :rules="idRules"
              label="Room ID"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="back">Back</v-btn>
          <v-btn text :disabled="!valid" @click="join">Join</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";

export default {
  data: () => ({
    active: false,
    resolve: null,
    valid: false,
    name: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => v.length >= 3 || "Name must be at least 3 characters",
      (v) => v.length <= 32 || "Name must be 32 characters or less",
      (v) =>
        /^[a-zA-Z ]{3,32}$/.test(v) || "Name must be only letters and spaces",
    ],
    id: "",
    idRules: [
      (v) => !!v || "ID is required",
      (v) => v.length === 16 || "ID must be 16 characters",
      (v) =>
        /^[a-z0-9]{16}$/.test(v) ||
        "Name must be only lowercase letters and numbers",
    ],
  }),
  created() {
    this.name = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: "capital",
      separator: " ",
    });
  },
  methods: {
    open() {
      this.active = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
      });
    },
    join() {
      this.active = false;
      this.resolve({ name: this.name, id: this.id });
    },
    back() {
      window.location.reload();
    },
  },
};
</script>
