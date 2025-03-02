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
  <style scoped>
  .success-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f3e7; /* Même couleur que la page de confirmation */
  }
  
  .success-box {
    text-align: center;
    padding: 40px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    animation: fadeIn 0.5s ease-in-out;
  }
  
  h2 {
    font-size: 24px;
    color: #d4a373;
  }
  
  p {
    font-size: 18px;
    color: #333;
    margin-top: 10px;
  }
  
  /* Animation d'attente */
  .loading-spinner {
    margin: 20px auto;
    width: 40px;
    height: 40px;
    border: 5px solid #d4a373;
    border-top: 5px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  /* Animation fadeIn */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Animation spin */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>