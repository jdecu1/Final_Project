const API_BASE = "http://localhost:5959/api";

export const api = {
  async getAllCases() {
    return fetch(`${API_BASE}/cases`).then(r => r.json());
  },

  async getCase(caseNumber) {
    return fetch(`${API_BASE}/cases/${caseNumber}`).then(r => r.json());
  },

  async getCalculations(caseNumber) {
    return fetch(`${API_BASE}/cases/${caseNumber}/calculations`).then(r => r.json());
  },

  async createCase(data) {
    return fetch(`${API_BASE}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },

  async addCalculation(caseNumber, data) {
    return fetch(`${API_BASE}/cases/${caseNumber}/calculations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },


  exportCasePdfUrl(caseNumber) {
    return `${API_BASE}/cases/${caseNumber}/export`;
  }
};
