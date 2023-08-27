import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import MinesweeperGame from "@/pages/MinesweeperGame.vue";

const routes = [
  {
    path: "/",
    component: MainPage
  },
  {
    path: "/minesweeper-game",
    component: MinesweeperGame
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
