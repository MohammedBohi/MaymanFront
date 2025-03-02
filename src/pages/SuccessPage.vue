<template>
    <div class="success-container">
      <h2>🎉 Paiement Réussi !</h2>
      <p>Nous vérifions votre paiement...</p>
    </div>
  </template>
  
  <script>
  import { useRouter, useRoute } from "vue-router";
  import { ref, onMounted } from "vue"; // ✅ Ajout de `ref` et `onMounted`

  
  export default {
    setup() {
      const router = useRouter();
      const route = useRoute();
      const sessionId = ref(route.query.session_id); // 🔥 Définit bien `sessionId`


      const verifyPayment = async () => {  
        if (!sessionId.value) {
          console.error("❌ sessionId manquant !");
          router.push("/"); // 🔥 Redirige si pas de session_id
          return;
        }
  
        const token = localStorage.getItem("token");
        if (!token) {
        console.error("❌ Aucun token trouvé, redirection vers connexion !");
        router.push("/login-register"); 
        return;
      }

        try {
          const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/paiement/statut/${sessionId.value}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`, // ✅ Corrigé
            },
          });
  
          const result = await response.json();
  
          if (!response.ok || !result.reservation) {
            console.error("❌ Paiement non validé ou réservation introuvable !");
            router.push("/"); // 🔥 Redirige si erreur
            return;
          }
  
          // 🔥 Nettoie session_id après confirmation
          localStorage.removeItem("stripe_session_id");
  
          // 🚀 Redirige vers la page de confirmation
          router.push({
            name: "ConfirmationReservation",
            query: result.reservation
          });
  
        } catch (error) {
          console.error("❌ Erreur lors de la vérification du paiement :", error);
          router.push("/");
        }
      };
      onMounted(() => {
      verifyPayment();
    });

    return {
      sessionId
    };
  },
};
  </script>
  