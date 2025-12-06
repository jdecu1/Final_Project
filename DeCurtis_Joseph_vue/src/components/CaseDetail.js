import { api } from "../../api.js";

export default {
  data() {
    return {
      caseData: null,
      calculations: [],
      loading: true
    };
  },

  async created() {
    const caseNumber = this.$route.params.caseNumber;

    this.caseData = await api.getCase(caseNumber);

    const rawCalculations = await api.getCalculations(caseNumber) || [];

    this.calculations = rawCalculations
      .map((item) => {
        let calc = item;

        if (typeof calc === "string") {
          try {
            calc = JSON.parse(calc);
          } catch {
            return null;
          }
        }

        if (!calc || typeof calc !== "object") return null;

        if (!calc.input || typeof calc.input !== "object") {
          calc.input = {};
        }
        if (!calc.output || typeof calc.output !== "object") {
          calc.output = {};
        }

        return calc;
      })
      .filter(Boolean);

    this.loading = false;
  },

  methods: {
    goToAddCalculation() {
      this.$router.push(`/cases/${this.caseData.caseNumber}/add-calculation`);
    },

    downloadPdf() {
      const url = api.exportCasePdfUrl(this.caseData.caseNumber);
      window.open(url, "_blank");
    },

    formatType(type) {
      if (!type) return "";
      switch (type) {
        case "skid_to_stop":
          return "Skid to Stop";
        case "critical_speed_curve":
          return "Critical Speed Curve";
        case "momentum_two_vehicle":
          return "Momentum (Two Vehicle)";
        case "delta_v":
          return "Delta-V";
        case "drag_sled_test":
          return "Drag Sled Test";
        default:
          return type.replace(/_/g, " ").toUpperCase();
      }
    }
  },

  template: `
    <div class="page">

      <h2>Case {{ caseData && caseData.caseNumber }}</h2>

      <div v-if="loading">Loading...</div>

      <div v-else>

        <div class="case-card">
          <h3>Case Information</h3>

          <p><strong>Date Created:</strong> {{ caseData.dateCreated }}</p>

          <p><strong>Investigators:</strong></p>
          <ul>
            <li v-for="inv in caseData.investigators">
              {{ inv.fname }} {{ inv.mname }} {{ inv.lname }} ({{ inv.surname }})
            </li>
          </ul>

          <p><strong>Location:</strong></p>
          <ul>
            <li v-for="loc in caseData.location">
              {{ loc.numeric }} {{ loc.streetAddress }}, {{ loc.city }}, {{ loc.state }}
            </li>
          </ul>

          <p><strong>Notes:</strong> {{ caseData.notes }}</p>

          <button @click="goToAddCalculation()">Add Calculation</button>
          <button @click="downloadPdf()">Download PDF Report</button>
        </div>

        <div class="calc-section">
          <h3>Calculations</h3>

          <div v-if="calculations.length === 0" class="empty-message">
            No calculations have been added yet.
          </div>

          <div v-for="calc in calculations" class="calc-card">

            <h4>{{ formatType(calc.type) }}</h4>
            <p><strong>Timestamp:</strong> {{ calc.timestamp }}</p>

            <div v-if="calc.type === 'skid_to_stop'" class="calc-sub">
              <p>Skid Distance: <strong>{{ calc.input.skidDistance_ft }} ft</strong></p>
              <p>Drag Factor: <strong>{{ calc.input.dragFactor }} (unitless)</strong></p>
              <p>Brake Efficiency: <strong>{{ calc.input.brakeEfficiency }}</strong></p>
              <p>Estimated Speed: <strong>{{ calc.output.estimatedSpeed_mph }} mph</strong></p>
            </div>

            <div v-else-if="calc.type === 'critical_speed_curve'" class="calc-sub">
              <p>Curve Radius: <strong>{{ calc.input.radius_ft }} ft</strong></p>
              <p>Superelevation: <strong>{{ calc.input.superelevation }}</strong></p>
              <p>Drag Factor: <strong>{{ calc.input.dragFactor }} (unitless)</strong></p>
              <p>Critical Speed: <strong>{{ calc.output.criticalSpeed_mph }} mph</strong></p>
            </div>

            <div v-else-if="calc.type === 'momentum_two_vehicle'" class="calc-sub">
              <p>Vehicle 1 Mass: <strong>{{ calc.input.vehicle1_mass_lb }} lb</strong></p>
              <p>Vehicle 1 Post-Impact Speed: <strong>{{ calc.input.vehicle1_postImpactSpeed_mph }} mph</strong></p>
              <p>Vehicle 2 Mass: <strong>{{ calc.input.vehicle2_mass_lb }} lb</strong></p>
              <p>Vehicle 2 Post-Impact Speed: <strong>{{ calc.input.vehicle2_postImpactSpeed_mph }} mph</strong></p>
              <p>Approach Angle: <strong>{{ calc.input.approachAngle_deg }}°</strong></p>
              <p><strong>Pre-Impact Speeds:</strong></p>
              <ul>
                <li>Vehicle 1: <strong>{{ calc.output.vehicle1_preImpactSpeed_mph }} mph</strong></li>
                <li>Vehicle 2: <strong>{{ calc.output.vehicle2_preImpactSpeed_mph }} mph</strong></li>
              </ul>
            </div>

            <div v-else-if="calc.type === 'delta_v'" class="calc-sub">
              <p>Longitudinal ΔV: <strong>{{ calc.input.longitudinalDeltaV_mph }} mph</strong></p>
              <p>Lateral ΔV: <strong>{{ calc.input.lateralDeltaV_mph }} mph</strong></p>
              <p>Source: <strong>{{ calc.input.source }}</strong></p>
              <p>Total ΔV: <strong>{{ calc.output.totalDeltaV_mph }} mph</strong></p>
            </div>

            <div v-else-if="calc.type === 'drag_sled_test'" class="calc-sub">
              <p>Sled Weight: <strong>{{ calc.input.sledWeight }} lb</strong></p>
              <p v-if="calc.output.averagePull !== undefined">
                Average Pull: <strong>{{ calc.output.averagePull }} lbs</strong>
              </p>
              <p v-if="calc.output.dragFactor !== undefined">
                Drag Factor (f): <strong>{{ calc.output.dragFactor }}</strong>
              </p>
              <p><strong>Pulls (lbs):</strong></p>
              <ul>
                <li>Run 1: <strong>{{ calc.input.run1 }}</strong></li>
                <li>Run 2: <strong>{{ calc.input.run2 }}</strong></li>
                <li>Run 3: <strong>{{ calc.input.run3 }}</strong></li>
                <li>Run 4: <strong>{{ calc.input.run4 }}</strong></li>
                <li>Run 5: <strong>{{ calc.input.run5 }}</strong></li>
                <li>Run 6: <strong>{{ calc.input.run6 }}</strong></li>
                <li>Run 7: <strong>{{ calc.input.run7 }}</strong></li>
                <li>Run 8: <strong>{{ calc.input.run8 }}</strong></li>
                <li>Run 9: <strong>{{ calc.input.run9 }}</strong></li>
                <li>Run 10: <strong>{{ calc.input.run10 }}</strong></li>
              </ul>
            </div>

            <div v-else class="calc-sub">
              <div class="calc-sub">
                <strong>Inputs (raw):</strong>
                <pre>{{ JSON.stringify(calc.input, null, 2) }}</pre>
              </div>
              <div class="calc-sub">
                <strong>Outputs (raw):</strong>
                <pre>{{ JSON.stringify(calc.output, null, 2) }}</pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
};
