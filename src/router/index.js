import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import VerifyView from "../views/VerifyView.vue";
import TestView from "../views/TestView.vue";

const routes = [
    {
        path: "/",
        name: "home",
        component: HomeView,
    },
    {
        path: "/verify/:code",
        name: "verify",
        component: VerifyView,
    },
    {
        path: "/test",
        name: "test",
        component: TestView,
    },
    // {
    //     path: "/about",
    //     name: "about",
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () =>
    //         import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
    // },
    // {
    //     path: "/login",
    //     name: "login",
    //     components: {
    //         // 这里的 goods 对应 router-view 中的 name
    //         login: () => import("../views/login/index.vue")
    //     }
    // },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                selector: to.hash,
            };
        }
    },
});

export default router;
