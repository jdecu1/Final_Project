import router from "./router.js";

const App = {
  template: `
    <router-view></router-view>
  `
};

const app = Vue.createApp(App);
app.use(router);
app.mount("#app");
