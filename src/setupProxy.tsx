const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app: any) {
  app.use(
    "/tfhub-proxy",
    createProxyMiddleware({
      target: "https://tfhub.dev",
      changeOrigin: true,
      pathRewrite: {
        "^/tfhub-proxy": "",
      },
    })
  );
};
