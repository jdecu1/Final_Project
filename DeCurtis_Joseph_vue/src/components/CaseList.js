import { api } from "../../api.js";

export default {
  data() {
    return { cases: [] };
  },
  async created() {
    this.cases = await api.getAllCases();
  },
  template: `
    <div class="page">
      <h2>Cases</h2>

      <button @click="$router.push('/create')">Create New Case</button>

      <ul>
        <li v-for="c in cases" :key="c.caseNumber">
          <router-link :to="'/cases/' + c.caseNumber">
            {{ c.caseNumber }} - {{ c.notes }}
          </router-link>
        </li>
      </ul>
    </div>
  `
};
