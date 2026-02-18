const axios = require("axios");
const config = require("../config");

const client = axios.create({
  baseURL: config.onesBaseUrl,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${config.onesToken}`,
    "Content-Type": "application/json"
  }
});

client.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data && err.response.data.message ? err.response.data.message : "";
      return Promise.reject(new Error(`ONES API error ${status} ${message}`));
    }
    return Promise.reject(err);
  }
);

module.exports = client;
