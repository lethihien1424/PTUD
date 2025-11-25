const mysql = require("mysql2/promise");

// Cấu hình kết nối database
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "ptud_1",
  port: 3306,
  charset: "utf8mb4",
};

// Tạo pool kết nối để tối ưu hiệu suất
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Kết nối database thành công!");
    connection.release();
  } catch (error) {
    console.error("❌ Lỗi kết nối database:", error.message);
  }
};

module.exports = {
  pool,
  testConnection,
};
