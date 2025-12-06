import { api } from "../../api.js";


export default {
  data() {
    return {
      investigator: { fname: "", mname: "", lname: "", surname: "" },
      location: { numeric: "", streetAddress: "", city: "", state: "" },
      notes: ""
    };
  },
  methods: {
    async submitCase() {
      const payload = {
        investigators: [this.investigator],
        location: [this.location],
        notes: this.notes
      };

      const result = await api.createCase(payload);
      this.$router.push("/cases/" + result.caseNumber);
    }
  },
  template: `
    <div class="page">
      <h2>Create New Case</h2>

      <h3>Investigator</h3>
      <input v-model="investigator.fname" placeholder="First name">
      <input v-model="investigator.mname" placeholder="Middle name">
      <input v-model="investigator.lname" placeholder="Last name">
      <input v-model="investigator.surname" placeholder="Surname / Title">

      <h3>Location</h3>
      <input v-model="location.numeric" placeholder="Street number">
      <input v-model="location.streetAddress" placeholder="Street address">
      <input v-model="location.city" placeholder="City">
      <input v-model="location.state" placeholder="State">

      <h3>Notes</h3>
      <textarea v-model="notes"></textarea>

      <br><br>
      <button @click="submitCase">Submit Case</button>
    </div>
  `
};
