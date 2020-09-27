import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import 'leaflet/dist/leaflet.css';
import { LMap, LImageOverlay, LMarker, LPopup, LPolyline, LCircleMarker } from "vue2-leaflet";
import { Icon } from "leaflet";
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import Clipboard from 'v-clipboard'

Vue.config.productionTip = false

// this part resolves an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

Vue.use(Clipboard)

Vue.component('l-map', LMap);
Vue.component('l-image-overlay', LImageOverlay);
Vue.component('l-marker', LMarker);
Vue.component('l-popup', LPopup);
Vue.component('l-polyline', LPolyline);
Vue.component('l-circle-marker', LCircleMarker);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
