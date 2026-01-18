import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js"; // Router
import VCalendar from "v-calendar"; // V-Calendar
import "v-calendar/dist/style.css"; // Styles de V-Calendar
import api from "./services/api"; // Import d'Axios configuré
import { MotionPlugin } from "@vueuse/motion"; // Animations ergonomiques

const app = createApp(App);

app.use(router);
app.use(VCalendar, { componentPrefix: "v" });
app.use(MotionPlugin);

app.config.globalProperties.$api = api; // Permet d'accéder à Axios globalement

app.mount("#app");
