import { api } from "../../../api.js";

export default {
  props: ["caseNumber"],
  data() {
    return {
      long: "",
      lat: "",
      source: "",
      result: null
    };
  },

  methods: {
    compute() {
      if (!this.long || !this.lat) {
        this.result = null;
        return;
      }

      const dx = parseFloat(this.long);
      const dy = parseFloat(this.lat);

      const total = Math.sqrt(dx * dx + dy * dy);

      this.result = total.toFixed(2);
    },

    async save() {

      const calculation = {
        type: "delta_v",
        input: {
          longitudinalDeltaV_mph: parseFloat(this.long),
          lateralDeltaV_mph: parseFloat(this.lat),
          source: this.source
        },
        output: {
          totalDeltaV_mph: parseFloat(this.result)
        }
      };

      await api.addCalculation(this.caseNumber, calculation);
      alert("Calculation saved!");
      this.$router.push("/cases/" + this.caseNumber);
    }
  },

  template: `
    <div class="form-wrapper">
      <h3>Delta-V</h3>

      <label>Longitudinal ΔV (mph):</label>
      <input type="number" v-model="long" @input="compute()" />

      <label>Lateral ΔV (mph):</label>
      <input type="number" v-model="lat" @input="compute()" />

      <label>Source (optional):</label>
      <input type="text" v-model="source" />

      <div v-if="result" class="result-box">
        Total Delta-V: <strong>{{ result }} mph</strong>
      </div>

      <button v-if="result" @click="save()">Save Calculation</button>
    </div>
  `
};
