<template>
    <div class="success-container">
      <h2>🎉 Paiement Réussi !</h2>
      <p>Nous vérifions votre paiement...</p>
    </div>
  </template>
  
  <script>
  import { useRouter, useRoute } from "vue-router";
  
  export default {
    setup() {
      const router = useRouter();
      const route = useRoute();

      console.log("📡 Vérification du paiement avec session_id :", sessionId);
console.log(`📡 URL API appelée : ${process.env.VUE_APP_API_BASE_URL}/paiement/statut/${sessionId}`);

      const verifyPayment = async () => {
        let sessionId = route.query.session_id;
  
        if (!sessionId) {
          console.error("❌ sessionId manquant !");
          router.push("/"); // 🔥 Redirige si pas de session_id
          return;
        }
  
        try {
          const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/paiement/statut/${sessionId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });
  
          const result = await response.json();
  
          if (!response.ok || !result.reservation) {
            console.error("❌ Paiement non validé ou réservation introuvable !");
            router.push("/"); // 🔥 Redirige si erreur
            return;
          }
  
    console.log("✅ Paiement confirmé, réservation :", result.reservation);
    console.log("🚀 Redirection vers ConfirmationReservation avec :", result.reservation);
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
  
      verifyPayment();
    },
  };
  </script>
  