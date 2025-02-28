<template>
  <div id="app">
    <Header />
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Foot.vue";
import { onMounted } from "vue";
import { checkAuth } from "@/services/AuthService.js"; // Correction de l'import

export default {
  components: {
    Header,
    Footer,
  },
  setup() {
    onMounted(async () => {
      const user = await checkAuth();
    });
  },
};
</script>
