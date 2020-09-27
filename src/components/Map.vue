<template>
  <div id="map-area">
    <l-map
      v-if="visible"
      id="map"
      ref="map"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :zoom="zoom"
      :center="center"
      :crs="crs"
      @click="onClick($event.latlng)"
      @contextmenu="onRightClick"
    >
      <l-image-overlay :url="url" :bounds="bounds" />
      <template v-for="[id, lines] in Object.entries(userLines)">
        <l-polyline
          v-if="lines.length > 1"
          :lat-lngs="lines"
          :color="drawColors[id] ? drawColors[id] : '#FF0000'"
          :key="`line-${id}`"
        />
        <l-circle-marker
          v-else-if="lines.length === 1"
          :lat-lng="{ lat: lines[0][0], lng: lines[0][1] }"
          :radius="2"
          :color="drawColors[id] ? drawColors[id] : '#FF0000'"
          :key="`circle-${id}`"
        />
      </template>

      <l-marker
        v-for="(marker, i) in markers"
        :lat-lng="{ lat: marker.lat, lng: marker.lng }"
        :key="i"
      >
        <l-popup>
          <div class="text-center">
            <b>{{ marker.name }}</b>
            <br />
            <v-btn @click="deleteMarker(marker.id)" depressed color="error">
              Delete
            </v-btn>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
    <div class="toolbox" v-if="visible">
      <v-btn @click="drawMode = !drawMode" class="mt-2 mr-2">
        {{ drawMode ? "Disable draw mode" : "Enable draw mode" }}
      </v-btn>
      <v-btn v-if="drawMode" class="delete mt-2 mr-2" @click="color">
        Color
      </v-btn>
      <v-btn v-if="drawMode" class="delete mt-2 mr-2" @click="deleteLine">
        Delete
      </v-btn>
    </div>
    <StartDialog ref="startDialog" />
    <CreateDialog ref="createDialog" />
    <IDDialog ref="idDialog" />
    <JoinDialog ref="joinDialog" />
    <ColorDialog ref="colorDialog" />
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import StartDialog from "./StartDialog.vue";
import CreateDialog from "./CreateDialog.vue";
import IDDialog from "./IDDialog.vue";
import JoinDialog from "./JoinDialog.vue";
import ColorDialog from "./ColorDialog.vue";
import { CRS, latLng } from "leaflet";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";

let peer;

export default {
  name: "Map",
  components: {
    StartDialog,
    CreateDialog,
    IDDialog,
    JoinDialog,
    ColorDialog,
  },
  data() {
    return {
      overlay: true,
      visible: false,
      ownName: "",
      url: "",
      bounds: [
        [0, 0],
        [1, 1],
      ],
      minZoom: -3,
      maxZoom: 2,
      zoom: 0,
      center: latLng(0, 0),
      drawMode: false,
      drawColors: {},
      userLines: [],
      markers: [],
      crs: CRS.Simple,
      master: false,
      id: "",
      remoteID: "",
    };
  },
  mounted() {
    peer = new Peer();
    peer.on("open", () => {
      this.id = peer.id;
      peer.on("connection", (conn) => {
        conn.on("open", () => {
          conn.on("data", (data) => {
            this.onData(conn, data);
          });
          this.onConnectionOpened(conn);
        });
      });
      this.overlay = false;
      this.$refs.startDialog.open().then((create) => {
        if (create) {
          this.$refs.createDialog.open().then((data) => {
            this.$refs.idDialog.open(peer.id);
            this.onCreated(data);
          });
        } else {
          this.$refs.joinDialog.open().then((data) => {
            this.onJoined(data);
          });
        }
      });
    });
  },
  methods: {
    onCreated(data) {
      this.ownName = data.name;
      this.master = true;
      this.toBase64(data.file)
        .then((url) => {
          this.url = url;
          this.visible = true;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    onJoined(data) {
      this.ownName = data.name;
      console.log(`Joining to '${data.id}'`);
      const conn = peer.connect(data.id, { label: data.name });
      conn.on("open", () => {
        this.remoteID = data.id;
        conn.on("data", (data) => {
          this.onData(conn, data);
        });
        conn.on("close", () => {
          window.location.reload();
        });
      });
    },
    onData(conn, data) {
      console.log(`Received data from '${conn ? conn.label : "self"}': `, data);
      if (data.type === "image") {
        this.url = data.image;
        this.visible = true;
      } else if (data.type === "marker") {
        this.markers.push(data.marker);
      } else if (data.type === "delete_marker") {
        this.markers = this.markers.filter((el) => el.id !== data.id);
      } else if (data.type === "line") {
        this.$delete(this.userLines, data.id);
        this.$set(this.userLines, data.id, data.lines);
      } else if (data.type === "color") {
        this.$delete(this.drawColors, data.id);
        this.$set(this.drawColors, data.id, data.color);
      } else if (data.type === "broadcast" && this.master) {
        this.onData(conn, data.data);
        for (const c of Object.values(peer.connections)) {
          c[0].send(data.data);
        }
      }
    },
    onConnectionOpened(conn) {
      console.log(`Incoming connection from '${conn.label}', '${conn.peer}'`);
      conn.send({ type: "image", image: this.url });
      for (const marker of this.markers) {
        conn.send({ type: "marker", marker: marker });
      }
      for (const [id, lines] of Object.entries(this.userLines)) {
        conn.send({ type: "line", lines: lines, id: id });
      }
      for (const [id, color] of Object.entries(this.drawColors)) {
        conn.send({ type: "color", color: color, id: id });
      }
    },
    onClick(latlng) {},
    onRightClick(evt) {
      if (this.drawMode) {
        if (!this.userLines[peer.id]) {
          this.userLines[peer.id] = [];
        }
        this.broadcastPacket({
          type: "line",
          id: peer.id,
          lines: [...this.userLines[peer.id], [evt.latlng.lat, evt.latlng.lng]],
        });
        this.$nextTick(() => {
          this.$forceUpdate();
        });
        return;
      }
      const marker = {
        lat: evt.latlng.lat,
        lng: evt.latlng.lng,
        name: this.ownName,
        id: uuidv4(),
      };
      this.broadcastPacket({ type: "marker", marker: marker });
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    },
    getSize(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        });
        img.src = url;
      });
    },
    broadcastPacket(packet) {
      const wrappedPacket = { type: "broadcast", data: packet };
      if (this.master) {
        this.onData(null, wrappedPacket);
      } else {
        for (const conn of peer.connections[Object.keys(peer.connections)[0]]) {
          conn.send(wrappedPacket);
        }
      }
    },
    deleteMarker(id) {
      this.broadcastPacket({ type: "delete_marker", id: id });
    },
    color() {
      this.$refs.colorDialog.open(this.drawColors).then((color) => {
        this.broadcastPacket({ type: "color", id: this.id, color: color.hex });
      });
    },
    deleteLine() {
      if (!this.userLines[peer.id]) {
        return;
      }
      this.userLines[peer.id].pop();
      this.broadcastPacket({
        type: "line",
        id: peer.id,
        lines: this.userLines[peer.id],
      });
    },
  },
  watch: {
    url(url) {
      this.getSize(url).then((size) => {
        this.bounds = [
          [0, 0],
          [size.height, size.width],
        ];
        this.center = latLng(size.height / 2, size.width / 2);
      });
    },
  },
  computed: {
    masterID() {
      return this.master ? this.id : this.remoteID;
    },
  },
};
</script>

<style scoped>
#map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

#map-area {
  height: 100%;
  width: 100%;
}

.toolbox {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.toolbox > .v-btn {
  display: block;
}

.delete {
  float: right;
}
</style>
