import { api } from "../../../api.js";

export default {
  props: ["caseNumber"],
  data() {
    return {
      radius_ft: "",
      superelevation: "",
      dragFactor: "",
      result: null
    };
  },

  methods: {
    compute() {
      if (!this.radius_ft || !this.dragFactor || !this.superelevation) {
        this.result = null;
        return;
      }

      const r = parseFloat(this.radius_ft);
      const e = parseFloat(this.superelevation);
      const f = parseFloat(this.dragFactor);

      // Standard CSC formula
      const v = Math.sqrt(15 * r * (e + f));

      this.result = v.toFixed(2);
    },

    async save() {

      const calculation = {
        type: "critical_speed_curve",
        input: {
          radius_ft: parseFloat(this.radius_ft),
          superelevation: parseFloat(this.superelevation),
          dragFactor: parseFloat(this.dragFactor)
        },
        output: {
          criticalSpeed_mph: parseFloat(this.result)
        }
      };

      await api.addCalculation(this.caseNumber, calculation);

      alert("Calculation saved!");
      this.$router.push("/cases/" + this.caseNumber);
    }
  },

  template: `
    <div class="form-wrapper">
      <h3>Critical Speed Curve</h3>

      <label>Radius (ft):</label>
      <input type="number" v-model="radius_ft" @input="compute()" />

      <label>Superelevation (decimal):</label>
      <input type="number" step="0.01" v-model="superelevation" @input="compute()" />

      <label>Drag Factor:</label>
      <input type="number" step="0.01" v-model="dragFactor" @input="compute()" />

      <div v-if="result" class="result-box">
        Critical Speed: <strong>{{ result }} mph</strong>
      </div>

      <button v-if="result" @click="save()">Save Calculation</button>
    </div>
  `
};
