import { api } from "../../../api.js";

export default {
  props: ["caseNumber"],

  data() {
    return {
      sledWeight: "",
      runs: Array.from({ length: 10 }, () => ""),
      avgPull: null,
      dragFactor: null
    };
  },

  methods: {
    compute() {
      // Ensure sled weight exists AND all runs contain numeric values
      if (
        this.sledWeight === "" ||
        this.runs.some(r => r === "" || isNaN(parseFloat(r)))
      ) {
        this.avgPull = null;
        this.dragFactor = null;
        return;
      }

      const weight = parseFloat(this.sledWeight);
      const pulls = this.runs.map(r => parseFloat(r));
      const sum = pulls.reduce((a, b) => a + b, 0);
      const avg = sum / pulls.length;

      const f = avg / weight;

      this.avgPull = avg.toFixed(3);
      this.dragFactor = f.toFixed(3);
    },

    async save() {
      const pullsObj = {};
      this.runs.forEach((v, index) => {
        pullsObj[`run${index + 1}`] = parseFloat(v);
      });

      const calculation = {
        type: "drag_sled_test",
        input: {
          sledWeight: parseFloat(this.sledWeight),
          ...pullsObj
        },
        output: {
          averagePull: parseFloat(this.avgPull),
          dragFactor: parseFloat(this.dragFactor)
        }
      };

      await api.addCalculation(this.caseNumber, calculation);

      alert("Calculation saved!");
      this.$router.push("/cases/" + this.caseNumber);
    }
  },

  template: `
    <div class="form-wrapper">
      <h3>Drag Sled Test (10 Pulls)</h3>

      <label>Drag Sled Weight (lbs):</label>
      <input type="number" step="0.01" v-model="sledWeight" @input="compute()" />

      <div v-for="(run, index) in runs" :key="index">
        <label>Run {{ index + 1 }}:</label>
        <input 
          type="number"
          step="0.01"
          v-model="runs[index]"
          @input="compute()"
        />
      </div>

      <div v-if="avgPull !== null" class="result-box">
        <p>Average Pull Value: <strong>{{ avgPull }}</strong></p>
        <p>Drag Factor (f): <strong>{{ dragFactor }}</strong></p>
      </div>

      <button v-if="dragFactor !== null" @click="save()">Save Calculation</button>
    </div>
  `
};
