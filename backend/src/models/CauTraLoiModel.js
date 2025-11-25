const { pool } = require("../config/db");

const CauTraLoiModel = {
  deleteByBaiLam(maBaiLam) {
    return pool.execute("DELETE FROM cautraloi WHERE maBaiLam = ?", [maBaiLam]);
  },

  insert(maCauTraLoi, maCauHoi, maDapAn, maBaiLam) {
    return pool.execute(
      `INSERT INTO cautraloi (maCauTraLoi, maCauHoi, maDapAn, maBaiLam)
       VALUES (?, ?, ?, ?)`,
      [maCauTraLoi, maCauHoi, maDapAn, maBaiLam]
    );
  }
};

module.exports = CauTraLoiModel;
