import { api } from "../../../api.js";

export default {
  props: ["caseNumber"],
  data() {
    return {
      v1_mass: "",
      v1_post: "",
      v2_mass: "",
      v2_post: "",
      angle: "",
      result1: null,
      result2: null
    };
  },

  methods: {
    compute() {
      if (!this.v1_mass || !this.v2_mass || !this.v1_post || !this.v2_post || !this.angle) {
        this.result1 = this.result2 = null;
        return;
      }

      const m1 = parseFloat(this.v1_mass);
      const m2 = parseFloat(this.v2_mass);
      const v1 = parseFloat(this.v1_post);
      const v2 = parseFloat(this.v2_post);
      const A = (parseFloat(this.angle) * Math.PI) / 180;

      // Momentum vector math
      const px = m1 * v1 + m2 * v2 * Math.cos(A);
      const py = m2 * v2 * Math.sin(A);

      const preV1 = (px / m1).toFixed(2);
      const preV2 = (Math.sqrt(px * px + py * py) / m2).toFixed(2);

      this.result1 = preV1;
      this.result2 = preV2;
    },

    async save() {

      const calculation = {
        type: "momentum_two_vehicle",
        input: {
          vehicle1_mass_lb: parseFloat(this.v1_mass),
          vehicle1_postImpactSpeed_mph: parseFloat(this.v1_post),
          vehicle2_mass_lb: parseFloat(this.v2_mass),
          vehicle2_postImpactSpeed_mph: parseFloat(this.v2_post),
          approachAngle_deg: parseFloat(this.angle)
        },
        output: {
          vehicle1_preImpactSpeed_mph: parseFloat(this.result1),
          vehicle2_preImpactSpeed_mph: parseFloat(this.result2)
        }
      };

      await api.addCalculation(this.caseNumber, calculation);
      alert("Calculation saved!");
      this.$router.push("/cases/" + this.caseNumber);
    }
  },

  template: `
    <div class="form-wrapper">
      <h3>Momentum (Two Vehicle)</h3>

      <label>Vehicle 1 Mass (lb):</label>
      <input type="number" v-model="v1_mass" @input="compute()" />

      <label>Vehicle 1 Post-Impact Speed (mph):</label>
      <input type="number" step="0.1" v-model="v1_post" @input="compute()" />

      <label>Vehicle 2 Mass (lb):</label>
      <input type="number" v-model="v2_mass" @input="compute()" />

      <label>Vehicle 2 Post-Impact Speed (mph):</label>
      <input type="number" step="0.1" v-model="v2_post" @input="compute()" />

      <label>Approach Angle (degrees):</label>
      <input type="number" v-model="angle" @input="compute()" />

      <div v-if="result1" class="result-box">
        Vehicle 1 Pre-Impact Speed: <strong>{{ result1 }} mph</strong><br>
        Vehicle 2 Pre-Impact Speed: <strong>{{ result2 }} mph</strong>
      </div>

      <button v-if="result1" @click="save()">Save Calculation</button>
    </div>
  `
};
