import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import ReservationPage from "@/pages/ReservationPage.vue";
import LoginRegister from "@/pages/LoginRegister.vue";
import FormulaireReservation from "@/pages/FormulaireReservation.vue";
import ForgotPassword from "@/pages/ForgotPassword.vue";
import ResetPassword from "@/pages/ResetPassword.vue";
import ChangePassword from "@/pages/ChangePassword.vue";
import ConfirmationReservation from "@/pages/ConfirmationReservation.vue";
import SuccessPage from "@/pages/SuccessPage.vue";

import AdminDashboard from "@/pages/AdminDashboard.vue";
import AdminNewReservation from "@/pages/AdminNewReservation.vue";
import AdminIndisponibilites from "@/pages/AdminIndisponibilites.vue";
import AdminPlagesHoraires from "@/pages/AdminPlagesHoraires.vue";
import AdminPrestations from "@/pages/AdminPrestations.vue";
import AdminReservationCreneau from "@/pages/AdminReservationCreneau.vue";
import AdminReservations from "@/pages/AdminReservations.vue";
import AdminPlanning from "@/pages/AdminPlanning.vue";

import { checkAuth } from "@/services/AuthService";

const routes = [
  { path: "/login-register", name: "LoginRegister", component: LoginRegister },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },
  { path: "/change-password", name: "ChangePassword", component: ChangePassword, meta: { requiresAuth: true } },
  { path: "/reservation", name: "ReservationPage", component: ReservationPage },
  { path: "/reservation/:id", name: "Reservation", component: ReservationPage },
  { path: "/formulaire-reservation", name: "FormulaireReservation", component: FormulaireReservation },
  { path: "/confirmation", name: "ConfirmationReservation", component: ConfirmationReservation },
  { path: "/success", name: "SuccessPage", component: SuccessPage },

  // 🔐 ADMIN
  { path: "/admin", name: "AdminDashboard", component: AdminDashboard, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/admin/planning", name: "AdminPlanning", component: AdminPlanning, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/admin/nouvelle-reservation", name: "AdminNewReservation", component: AdminNewReservation, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/admin/indisponibilites", name: "AdminIndisponibilites", component: AdminIndisponibilites, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/admin/plages-horaires", name: "AdminPlagesHoraires", component: AdminPlagesHoraires, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/admin/prestations", name: "AdminPrestations", component: AdminPrestations, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/admin/reservation-creneau", name: "AdminReservationCreneau", component: AdminReservationCreneau, meta: { requiresAuth: true, role: "Admin" } },
  {
    path: "/admin/reservations",
    name: "AdminReservations",
    component: AdminReservations,
    meta: { requiresAuth: true, role: "Admin" }
  },
  {
    path: "/admin/success",
    name: "AdminSuccess",
    component: () => import("@/pages/AdminSuccess.vue"),
    meta: { requiresAuth: true, role: "Admin" }
  },
  {
    path: "/admin/confirmation",
    name: "AdminConfirmation",
    component: () => import("@/pages/AdminConfirmation.vue"),
    meta: { requiresAuth: true, role: "Admin" }
  },
  {
    path: "/",
    name: "Accueil",
    component: HomePage,
  },
  // 👤 CLIENT
  { path: "/client", name: "ClientHome", component: HomePage, meta: { requiresAuth: true, role: "Client" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});router.beforeEach(async (to, from, next) => {
  const publicPages = ["/", "/login-register", "/forgot-password", "/reset-password"];
  const isPublic = publicPages.includes(to.path);

  const user = await checkAuth();

  // 🔐 Route protégée sans user
  if (to.meta.requiresAuth && !user) return next("/");

  // 🔁 Redirection automatique après login
  if (user && isPublic) {
    const redirectPath = user.typeutilisateur === "Admin" ? "/admin" : "/client";
    if (to.path !== redirectPath) return next(redirectPath);
    return next(); // déjà sur bonne page
  }

  // ❌ Mauvais rôle pour route protégée
  if (to.meta.requiresAuth && user && to.meta.role && user.typeutilisateur !== to.meta.role) {
    const goodPath = user.typeutilisateur === "Admin" ? "/admin" : "/client";
    if (to.path !== goodPath) return next(goodPath);
    return next();
  }

  return next(); // ✅ tout est bon
});


export default router;