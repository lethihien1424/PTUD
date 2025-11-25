const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});
