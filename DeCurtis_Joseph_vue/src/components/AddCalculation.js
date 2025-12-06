import SkidToStopForm from "./forms/SkidToStopForm.js";
import CriticalSpeedForm from "./forms/CriticalSpeedCurveForm.js";
import MomentumForm from "./forms/MomentumForm.js";
import DeltaVForm from "./forms/DeltaVForm.js";
import DragSledForm from "./forms/DragSledForm.js";

export default {
  data() {
    return {
      selected: null
    };
  },

  components: {
    SkidToStopForm,
    CriticalSpeedForm,
    MomentumForm,
    DeltaVForm,
    DragSledForm
  },

  computed: {
    caseNumber() {
      return this.$route.params.caseNumber;
    }
  },

  template: `
    <div class="page calc-page">

      <h2>Add Calculation</h2>

      <div class="calc-menu">
        <button @click="selected = 'skid'">Skid to Stop</button>
        <button @click="selected = 'curve'">Critical Speed Curve</button>
        <button @click="selected = 'momentum'">Momentum</button>
        <button @click="selected = 'deltaV'">Delta-V</button>
        <button @click="selected = 'sled'">Drag Sled Test</button>
      </div>

      <div class="calc-form">

        <!-- Each form receives caseNumber as a prop -->
        <SkidToStopForm 
          v-if="selected === 'skid'" 
          :caseNumber="caseNumber" 
        />

        <CriticalSpeedForm 
          v-if="selected === 'curve'" 
          :caseNumber="caseNumber" 
        />

        <MomentumForm 
          v-if="selected === 'momentum'" 
          :caseNumber="caseNumber" 
        />

        <DeltaVForm 
          v-if="selected === 'deltaV'" 
          :caseNumber="caseNumber" 
        />

        <DragSledForm 
          v-if="selected === 'sled'" 
          :caseNumber="caseNumber" 
        />

      </div>

    </div>
  `
};
