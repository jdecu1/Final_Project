import BaseScreenView from "./src/components/BaseScreenView.js";
import CaseList from "./src/components/CaseList.js";
import CaseDetail from "./src/components/CaseDetail.js";
import CreateCase from "./src/components/CreateCase.js";
import About from "./src/components/About.js";
import AddCalculation from "./src/components/AddCalculation.js";


const routes = [
  {
    path: "/",
    component: BaseScreenView,
    children: [
      { path: "", component: CaseList },
      { path: "cases/:caseNumber", component: CaseDetail },
      { path: "create", component: CreateCase },
      { path: "about", component: About },
      { path: "cases/:caseNumber/add-calculation", component: AddCalculation }
    ]
  }
];

export default VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});
