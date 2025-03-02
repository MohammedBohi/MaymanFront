<template>
  <div class="reservation-form">
    <h2>Finaliser la réservation</h2>
    <form @submit.prevent="submitReservation">
      <label for="name">Nom</label>
      <input v-model="name" type="text" id="name" required placeholder="Entrez votre nom" />

      <label for="surname">Prénom</label>
      <input v-model="surname" type="text" id="surname" required placeholder="Entrez votre prénom" />

      <label for="phone">Téléphone</label>
      <input v-model="phone" type="tel" id="phone" required placeholder="Entrez votre téléphone" />

      <label for="address">Adresse</label>
      <input v-model="address" type="text" id="address" required placeholder="Entrez votre adresse" />

      <label for="department">Département</label>
      <select v-model="selectedDepartment" id="department" required>
        <option v-for="dept in departments" :key="dept.codePostal" :value="dept">
  {{ dept.nom || dept.name || "Inconnu" }} ({{ dept.codePostal || dept.code || "00000" }})
</option>





      </select>

      <h3>Mode de paiement</h3>
      <div class="payment-buttons">
        <button type="button" class="golden-button" @click="handleOnSitePayment">Payer sur place</button>
        <button type="button" class="golden-button" @click="handleOnlinePayment">Payer en ligne</button>
      </div>
    </form>
  </div>
</template>

<script>
import { reserverSurPlace } from "@/services/ReservationService";
import { checkAuth } from "@/services/AuthService";
import { useRouter } from "vue-router";
import { loadStripe } from "@stripe/stripe-js";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { nextTick } from "vue";


export default {
  setup() {
    const router = useRouter();
    const route = useRoute(); // ✅ Récupérer les paramètres de l'URL
    const query = route.query; // ✅ Accéder aux paramètres

    const name = ref("");
    const surname = ref("");
    const phone = ref("");
    const address = ref("");
    const selectedDepartment = ref(null);
    const departments = ref([]);
    const prestation = ref(null);
    const selectedDay = ref(null);
    const selectedSlot = ref(null);


    onMounted(async () => {

      const user = await checkAuth();
      if (!user) {
        router.push("/login-register");
        return;
      }

      const query = router.currentRoute.value.query;
      console.log("🎯 Query params reçus:", query); // 🔥 Log pour vérifier les données passées via URL

      if (query.day) {
  selectedDay.value = new Date(query.day); 
  if (isNaN(selectedDay.value)) {
    const dateParts = query.day.split('/');
    selectedDay.value = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
  }
  console.log("✅ Date après correction :", selectedDay.value);
}


      if (Object.keys(query).length === 0) {
        const pendingReservation = localStorage.getItem("pendingReservation");
        if (pendingReservation) {
          const parsedData = JSON.parse(pendingReservation);

          prestation.value = {
            id: parsedData.prestationId || "unknown",
            name: parsedData.prestationName || "Prestation inconnue",
            price: parsedData.prestationPrice || 0,
          };

          selectedDay.value = new Date(query.day);
          console.log("🛠 Date reçue et convertie:", selectedDay.value);
          if (isNaN(selectedDay.value)) {
        // Si la date est invalide, transforme la date reçue au format `DD/MM/YYYY` en `YYYY-MM-DD`
        const dateParts = query.day.split('/');
        selectedDay.value = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);  // Format ISO
      }
      console.log("🛠 Date reçue et convertie:", selectedDay.value);


          selectedSlot.value = parsedData.slot;
          departments.value = Array.isArray(parsedData.departments) ? parsedData.departments : [];
          console.log("🛠 Prestation dans reservation form:", prestation.value); // 🔥 Log pour vérifier la prestation


          localStorage.removeItem("pendingReservation");
        } else {
          console.warn("⚠ Aucun choix de réservation trouvé.");
          router.push("/");
        }
      } else {

        prestation.value = {
          id: query.prestationId || "unknown",
          name: query.prestationName || "Prestation inconnue",
          price: query.prestationPrice || 0,
        };
    selectedDay.value = new Date(query.day); // Utiliser la date reçue en format local

    console.log("🛠 Date reçue et convertie:", selectedDay.value); // 🔥 Log pour vérifier la date 
    if (isNaN(selectedDay.value)) {
      // Si la date est invalide, transforme la date reçue au format `DD/MM/YYYY` en `YYYY-MM-DD`
      const dateParts = query.day.split('/');
      selectedDay.value = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);  // Format ISO
    }
    console.log("🛠 Date reçue et convertie:", selectedDay.value);  
    selectedSlot.value = query.slot;

        if (query.departments) {

  try {
    if (typeof query.departments === "string") {
      const decodedDepartments = decodeURIComponent(query.departments);
      if (decodedDepartments.startsWith("[") && decodedDepartments.endsWith("]")) {
        departments.value = JSON.parse(decodedDepartments);
      } else {
        console.warn("⚠ `query.departments` n'est pas un JSON valide. Annulation du parsing.");
        departments.value = [];
      }
    } else if (Array.isArray(query.departments)) {
      // ✅ Si c’est déjà un tableau, on l’utilise directement
      departments.value = query.departments;
    } else {
      console.warn("⚠ Type inattendu pour `query.departments` :", query.departments);
      departments.value = [];
    }

  } catch (error) {
    console.error("❌ Erreur parsing départements :", error);
    departments.value = [];
  }
}

// **🔹 Si `query.departments` est vide, essaie depuis `localStorage`**
if (!departments.value.length) {
  console.warn("⚠ Aucun département trouvé dans `query.departments` ! Récupération via `localStorage`...");
  const pendingReservation = localStorage.getItem("pendingReservation");

  if (pendingReservation) {
    try {
      const parsedData = JSON.parse(pendingReservation);
      departments.value = parsedData.departments || [];
    } catch (error) {
      console.error("❌ Erreur parsing `pendingReservation` :", error);
    }
  }
}

await nextTick(); // 🔥 Force Vue à mettre à jour l'affichage



      } 

      departments.value.forEach((dept, index) => {
      });
    });

    // 🔹 Validation du formulaire
    const validateForm = () => {
      if (!name.value || !surname.value || !phone.value || !address.value || !selectedDepartment.value) {
        alert("Veuillez remplir tous les champs obligatoires !");
        return false;
      }
      if (!/^\d{10}$/.test(phone.value)) {
        alert("Veuillez saisir un numéro de téléphone valide (10 chiffres) !");
        return false;
      }
      return true;
    };
   const parseDateForBackend = (dateStr) => {
    if (!dateStr) return null;

    // 🔹 Vérifier si la date est en format DD/MM/YYYY et la transformer
    if (dateStr.includes('/')) {
        const dateParts = dateStr.split('/');
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // YYYY-MM-DD
    }

    // 🔹 Vérifier si c'est déjà une date valide
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) {
        console.error("❌ Date invalide:", dateStr);
        return null;
    }

    return dateObj.toISOString().split("T")[0]; // 🔥 YYYY-MM-DD garanti !
};

selectedDay.value = parseDateForBackend(query.day);
console.log("✅ Date corrigée et normalisée :", selectedDay.value);

    // 🔹 Gérer la réservation sur place
    const handleOnSitePayment = async () => {
      if (validateForm()) {
        const reservationData = {
          nom: name.value,
          prenom: surname.value,
          telephone: phone.value,
          adresseReservation: address.value,
          prestation: prestation.value.name,
          tarif: prestation.value.price,
          jour: selectedDay.value.toISOString().split('T')[0],
          creneau: selectedSlot.value,
          departement: selectedDepartment.value?.nom || "Inconnu",
          typePaiement: "Sur place",
        };
        console.log("📦 Données envoyées au backend:", reservationData); // 🔥 Log pour vérifier les données envoyées
        console.log("Tarif avant envoi :", prestation.value.price);
        if (isNaN(prestation.value.price) || prestation.value.price <= 0) {
  alert("Le tarif est invalide.");
  return;
}

        try {
          const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/reservations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(reservationData),
          });

          const result = await response.json();
          console.log("✅ Réponse du backend:", result); // 🔥 Log pour vérifier la réponse du backend


          if (!response.ok) {
            throw new Error(result.error || "Une erreur est survenue.");
          }

          alert("Votre réservation a bien été prise en compte ! Vous allez recevoir un email de confirmation.");

          router.push({
            name: "ConfirmationReservation",
            query: reservationData
          });

        } catch (error) {
          console.error("❌ Erreur lors de la réservation :", error);
          alert("Erreur lors de la réservation ! Veuillez réessayer.");
        }
      }
    };

    // 🔹 Gestion du paiement en ligne
    const handleOnlinePayment = async () => {
  if (!validateForm()) return; // ✅ Vérifie que le formulaire est bien rempli
  if (!(selectedDay.value instanceof Date)) {
    console.warn("⚠ `selectedDay.value` n'est pas un objet Date ! Conversion en cours...");
    selectedDay.value = new Date(selectedDay.value);
  }
  console.log("✅ Date après conversion :", selectedDay.value); // Debugging

  
selectedDay.value = parseDateForBackend(query.day);
console.log("✅ Date corrigée et normalisée :", selectedDay.value);
  const reservationData = {
    nom: name.value,
    prenom: surname.value,
    telephone: phone.value,
    adresseReservation: address.value,
    prestation: prestation.value.name,
    tarif: prestation.value.price,
    jour: selectedDay.value.toISOString().split('T')[0],
    creneau: selectedSlot.value,
    departement: selectedDepartment.value?.nom || "Inconnu",
  };

  try {

    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/paiement/initier`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(reservationData),
    });

    const result = await response.json();

if (!response.ok || !result.url || !result.session_id) {  
  throw new Error(result.error || "Erreur : session_id manquant !");
}


    // **🔥 Vérification et stockage correct de `session_id`**
    if (result.session_id) {
  localStorage.setItem("stripe_session_id", result.session_id);

    } else {
      console.error("❌ Erreur : session_id est NULL ! Le stockage dans localStorage échoue.");
    }

    // **🔗 Redirection vers Stripe**
    window.location.href = result.url;

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du paiement :", error);
    alert("Erreur lors de l'initialisation du paiement.");
  }
};

onMounted(async () => {
  const route = useRoute();
  let sessionId = route.query.session_id;

  // ✅ Vérifie si la page a été ouverte depuis Stripe
  if (!sessionId) {
    return; // 🚀 Arrêter ici si l'utilisateur n'a pas encore payé.
  }


  // 🔥 **Si `session_id` est absent dans l'URL, on essaye `localStorage`**
  if (!sessionId || sessionId === "undefined" || sessionId === null || sessionId === "") {
    console.warn("⚠ sessionId absent dans l'URL, récupération depuis localStorage...");
    sessionId = localStorage.getItem("stripe_session_id");
  }

  // 🚨 **Si après tout ça `session_id` est toujours invalide, on arrête tout**
  if (!sessionId || sessionId === "undefined" || sessionId === null) {
    console.error("❌ sessionId toujours invalide ! Aucun paiement n'a été initié.");
    return; // ✅ Arrêter ici pour éviter une erreur inutile.
  }


  try {
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/paiement/statut/${sessionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await response.json();

    // ❌ **Si la requête échoue ou que la réservation n'est pas confirmée**
    if (!response.ok || !result.reservation) {
      console.error("❌ La réservation n'a pas été créée :", result);
      return;
    }


    // **🔥 Nettoyer le `session_id` stocké après paiement réussi**
    localStorage.removeItem("stripe_session_id");

    // 🎯 **Rediriger vers la page de confirmation avec les détails**
    router.push({
      name: "ConfirmationReservation",
      query: result.reservation || { error: "Aucune réservation trouvée" }
    });

  } catch (error) {
    console.error("❌ Erreur lors de la vérification du paiement :", error);
  }
});



  
return {
    name,
    surname,
    phone,
    address,
    selectedDepartment,
    departments,
    prestation,
    selectedDay,
    selectedSlot,
    handleOnlinePayment, // ✅ Paiement en ligne
    handleOnSitePayment, // ✅ Ajout du bouton "Payer sur place"
};

  },
};
</script>


<style scoped>
.reservation-form { 
  padding: 20px;
  background-color: #f8f3e7;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;       
  margin: 0 auto;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input, select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.payment-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.golden-button {
  background-color: #d4a373;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.golden-button:hover {
  background-color: #c58954;
}
</style>
