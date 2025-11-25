const fetch = require("node-fetch");

async function testLogin() {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenDangNhap: "hocsinhBao",
      matKhau: "Admin123@A",
    }),
  });

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    console.log("Kết quả:", data);
  } else {
    const text = await res.text();
    console.error("Response không phải JSON:", text);
  }
}

// Chạy kiểm tra
if (require.main === module) {
  testLogin();
}
