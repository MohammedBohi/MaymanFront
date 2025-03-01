import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import ReservationPage from "@/pages/ReservationPage.vue";
import LoginRegister from "@/pages/LoginRegister.vue";
import FormulaireReservation from "@/pages/FormulaireReservation.vue";
import ForgotPassword from "@/pages/ForgotPassword.vue";
import ResetPassword from "@/pages/ResetPassword.vue";

import AdminPage from "@/pages/AdminPage.vue";
import { checkAuth, getRole } from "@/services/AuthService";


const routes = [
  { path: "/", name: "Home", component: HomePage },
  { path: "/confirmation", name: "ConfirmationReservation", component: () => import("@/pages/ConfirmationReservation.vue") },
  { path: "/reservation", name: "Reservation", component: ReservationPage },
  { path: "/login-register", name: "LoginRegister", component: LoginRegister },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password/:token", component: ResetPassword },
  { path: "/formulaire-reservation", name: "FormulaireReservation", component: FormulaireReservation },
  { path: "/admin", name: "Admin", component: AdminPage, meta: { requiresAuth: true, role: "Admin" } },
  {
    path: "/success",
    name: "SuccessPage",
    component: () => import("@/pages/SuccessPage.vue"),
  },
  
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = await checkAuth();
    if (!user) next("/login-register");
    else if (to.meta.role && user.typeutilisateur !== to.meta.role) next("/");
    else next();
  } else {
    next();
  }
});

export default router;
