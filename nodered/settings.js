/**
 * Node-RED en Render: escuchar en 0.0.0.0 y en PORT (p. ej. 10000).
 * Ver docs/deploy-production.md (troubleshooting).
 */
module.exports = {
  flowFile: "flows.json",
  credentialSecret:
    process.env.NODE_RED_CREDENTIAL_SECRET || "dashboard-lot-render",
  uiPort: parseInt(process.env.PORT || "1880", 10),
  uiHost: "0.0.0.0",
  userDir: "/data",
  logging: {
    console: {
      level: "info",
      metrics: false,
      audit: false,
    },
  },
};
