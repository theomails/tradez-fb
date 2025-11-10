import { createWebHistory, createRouter } from "vue-router";

const routes =  [
  {
    path: "/login",
    name: "login",
    component: () => import("./views/Login")
  },{
    path: "/",
    alias: "/create-room",
    name: "create-room",
    component: () => import("./views/CreateRoom")
  },
  {
    path: "/room/:roomId",
    name: "room",
    component: () => import("./views/RoomDisplay"), 
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;