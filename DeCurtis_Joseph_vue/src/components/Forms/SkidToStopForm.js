import { api } from "../../../api.js";

export default {
  props: ["caseNumber"],

  data() {
    return {
      skidDistance_ft: "",
      dragFactor: "",
      brakeEfficiency: 1.0,
      result: null,
      saving: false
    };
  },

  async mounted() {
    await this.loadDragFactor();
  },

  methods: {
    async loadDragFactor() {
      try {
        const cn = this.caseNumber || (this.$route && this.$route.params.caseNumber);
        if (!cn) {
          console.warn("SkidToStopForm: no caseNumber available for drag factor lookup.");
          return;
        }

        const calcs = await api.getCalculations(cn);

        if (!Array.isArray(calcs) || calcs.length === 0) {
          return;
        }

        const sleds = calcs.filter(c => c && c.type === "drag_sled_test");
        if (!sleds.length) {
          return;
        }

        sleds.sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp) : 0;
          const tb = b.timestamp ? new Date(b.timestamp) : 0;
          return tb - ta;
        });

        const latest = sleds[0] || {};
        const out = latest.output || {};

        let f = null;

        if (typeof out.averageDragFactor !== "undefined") {
          f = out.averageDragFactor;
        } else if (typeof out.dragFactor !== "undefined") {
          f = out.dragFactor;
        }

        if (f === null || f === undefined) {
          return;
        }

        const numeric = parseFloat(f);
        if (Number.isNaN(numeric)) {
          return;
        }

        this.dragFactor = numeric.toFixed(3);
        this.compute();
      } catch (err) {
        console.error("SkidToStopForm: error loading drag factor from calculations:", err);
      }
    },

    compute() {
      if (!this.skidDistance_ft || !this.dragFactor) {
        this.result = null;
        return;
      }

      const d = parseFloat(this.skidDistance_ft);
      const f = parseFloat(this.dragFactor);
      const e = parseFloat(this.brakeEfficiency);

      if (Number.isNaN(d) || Number.isNaN(f) || Number.isNaN(e)) {
        this.result = null;
        return;
      }

      const speed = Math.sqrt(30 * d * f * e);
      this.result = speed.toFixed(2);
    },

    async save() {
      this.saving = true;

      const cn = this.caseNumber || (this.$route && this.$route.params.caseNumber);

      const calculation = {
        type: "skid_to_stop",
        input: {
          skidDistance_ft: parseFloat(this.skidDistance_ft),
          dragFactor: parseFloat(this.dragFactor),
          brakeEfficiency: parseFloat(this.brakeEfficiency)
        },
        output: {
          estimatedSpeed_mph: parseFloat(this.result)
        }
      };

      await api.addCalculation(cn, calculation);

      this.saving = false;

      alert("Calculation saved!");
      this.$router.push("/cases/" + cn);
    }
  },

template: `
  <div class="form-wrapper">
    <h3>Skid to Stop</h3>

    <label>Skid Distance (ft):</label>
    <input 
      type="number" 
      v-model="skidDistance_ft" 
      @input="compute()" 
    />

    <label>Drag Factor (unitless):</label>
    <input 
      type="number" 
      step="0.01" 
      v-model="dragFactor" 
      @input="compute()" 
    />

    <label>Brake Efficiency (1.0 = 100%):</label>
    <input 
      type="number" 
      step="0.01" 
      v-model="brakeEfficiency" 
      @input="compute()" 
    />

    <div v-if="result" class="result-box">
      Estimated Speed: <strong>{{ result }} mph</strong>
    </div>

    <button 
      v-if="result && !saving" 
      @click="save()"
    >
      Save Calculation
    </button>

    <button v-if="saving">Saving...</button>
  </div>
`

};
