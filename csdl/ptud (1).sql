-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 06, 2025 lúc 06:59 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ptud`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bailam`
--

CREATE TABLE `bailam` (
  `maBaiLam` varchar(10) NOT NULL,
  `maBaiTap` varchar(10) NOT NULL,
  `maHocSinh` int(10) NOT NULL,
  `ngayNop` datetime NOT NULL DEFAULT current_timestamp(),
  `fileNop` varchar(255) DEFAULT NULL,
  `diem` decimal(10,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baitap`
--

CREATE TABLE `baitap` (
  `maBaiTap` varchar(10) NOT NULL,
  `maLop` varchar(10) NOT NULL,
  `maMon` varchar(10) NOT NULL,
  `tieuDe` varchar(255) NOT NULL,
  `hanNop` datetime NOT NULL,
  `moTa` varchar(255) NOT NULL,
  `loaiBai` enum('Trắc nghiệm','Tự luận','','') NOT NULL,
  `ngayTao` datetime NOT NULL DEFAULT current_timestamp(),
  `trangThai` enum('Còn hạn','Hết hạn nộp','','') NOT NULL,
  `fileHuongDan` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bangphancong`
--

CREATE TABLE `bangphancong` (
  `maPhanCong` varchar(10) NOT NULL,
  `maGV` varchar(10) NOT NULL,
  `maLop` varchar(10) NOT NULL,
  `maMonHoc` varchar(10) NOT NULL,
  `ngayPhanCong` date NOT NULL,
  `trangThai` enum('Đã phân công','Chưa phân công','','') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bangthongbao`
--

CREATE TABLE `bangthongbao` (
  `maThongBao` varchar(10) NOT NULL,
  `noiDung` varchar(255) NOT NULL,
  `tieuDe` varchar(255) NOT NULL,
  `ngayDang` date NOT NULL DEFAULT current_timestamp(),
  `loaiThongBao` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cauhoi`
--

CREATE TABLE `cauhoi` (
  `maCauHoi` varchar(50) NOT NULL,
  `noiDung` varchar(255) NOT NULL,
  `maBaiTap` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cautraloi`
--

CREATE TABLE `cautraloi` (
  `maCauTraLoi` varchar(10) NOT NULL,
  `maCauHoi` varchar(10) NOT NULL,
  `maDapAn` varchar(10) NOT NULL,
  `maBaiLam` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chiettietdonvang`
--

CREATE TABLE `chiettietdonvang` (
  `maChiTiet` varchar(10) NOT NULL,
  `maDon` varchar(10) NOT NULL,
  `ngay` date NOT NULL,
  `buoi` enum('Sáng','Chiều','Cả ngày','') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitieutuyensinh`
--

CREATE TABLE `chitieutuyensinh` (
  `maChiTieu` varchar(10) NOT NULL,
  `namHoc` varchar(50) NOT NULL,
  `soLuong` bigint(20) NOT NULL,
  `maTruong` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dapan`
--

CREATE TABLE `dapan` (
  `maDapAn` varchar(10) NOT NULL,
  `maCauHoi` varchar(10) NOT NULL,
  `noiDung` varchar(255) NOT NULL,
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `diem`
--

CREATE TABLE `diem` (
  `maDiem` varchar(10) NOT NULL,
  `maHocSinh` varchar(10) NOT NULL,
  `maMonHoc` varchar(10) NOT NULL,
  `diem15p` float NOT NULL,
  `diem1tiet` float NOT NULL,
  `diemCK` float NOT NULL,
  `diemGK` float NOT NULL,
  `diemTK` decimal(3,1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donvanghoc`
--

CREATE TABLE `donvanghoc` (
  `maDon` varchar(10) NOT NULL,
  `ngayTao` datetime NOT NULL DEFAULT current_timestamp(),
  `lyDo` varchar(255) NOT NULL,
  `trangThai` enum('Chờ duyệt','Đã duyệt','','') NOT NULL,
  `maHocSinh` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giaovien`
--

CREATE TABLE `giaovien` (
  `maGV` varchar(10) NOT NULL,
  `hoTen` varchar(100) NOT NULL,
  `CCCD` int(12) NOT NULL,
  `diaChi` varchar(255) NOT NULL,
  `ngayBatDau` date NOT NULL,
  `chuyenMon` varchar(50) NOT NULL,
  `chucVu` varchar(50) NOT NULL,
  `ngayKetThuc` date DEFAULT NULL,
  `trangThai` tinyint(4) NOT NULL,
  `SDT` varchar(15) NOT NULL,
  `maTaiKhoan` varchar(10) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `giaovien`
--

INSERT INTO `giaovien` (`maGV`, `hoTen`, `CCCD`, `diaChi`, `ngayBatDau`, `chuyenMon`, `chucVu`, `ngayKetThuc`, `trangThai`, `SDT`, `maTaiKhoan`, `email`) VALUES
('GV001', 'Trần Kim Lan', 79372623, 'ABC/14 KP1, HCM', '2016-11-10', 'Toán', 'GVCN', '2025-11-14', 1, '0373798283', 'TK002', ''),
('GV01', 'Le Thi Hien ', 7901234, 'Nguyen văn bảo,HCM', '2025-11-03', 'Van', 'GVBM', NULL, 1, '0901234567', 'TK002', 'he@gmail.com');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hocphi`
--

CREATE TABLE `hocphi` (
  `maHocPhi` varchar(10) NOT NULL,
  `trangThai` enum('Chưa đóng','Đã đóng','','') NOT NULL,
  `thongTinHocPhi` varchar(255) NOT NULL,
  `soTien` varchar(255) NOT NULL,
  `maHocSinh` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hocsinh`
--

CREATE TABLE `hocsinh` (
  `maHocSinh` varchar(10) NOT NULL,
  `hoTen` varchar(100) NOT NULL,
  `ngaySinh` date NOT NULL,
  `gioiTinh` enum('Nam','Nữ','','') NOT NULL,
  `namHoc` varchar(10) NOT NULL,
  `maLop` varchar(10) NOT NULL,
  `maTaiKhoan` varchar(10) NOT NULL,
  `diaChi` varchar(255) NOT NULL,
  `tinhTrang` enum('Đang học','Bảo lưu','Tốt nghiệp','Nghỉ học') NOT NULL,
  `anhChanDung` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hocsinh`
--

INSERT INTO `hocsinh` (`maHocSinh`, `hoTen`, `ngaySinh`, `gioiTinh`, `namHoc`, `maLop`, `maTaiKhoan`, `diaChi`, `tinhTrang`, `anhChanDung`) VALUES
('HS001', 'Dương Bảo', '2015-11-03', 'Nam', '2022-2025', 'L001', 'TK001', '', 'Đang học', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ketquaxettuyen`
--

CREATE TABLE `ketquaxettuyen` (
  `maKetQua` varchar(10) NOT NULL,
  `trangThai` enum('Trúng tuyển NV1','Trúng tuyển NV2','Trúng tuyển NV3','Không trúng tuyển') NOT NULL,
  `namHoc` varchar(50) NOT NULL,
  `diemTrungTuyen` float NOT NULL,
  `diemMon1` float NOT NULL,
  `diemMon2` float NOT NULL,
  `diemMon3` float NOT NULL,
  `maThiSinh` varchar(10) NOT NULL,
  `maTruong` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `kqdiemdanh`
--

CREATE TABLE `kqdiemdanh` (
  `maDiemDanh` varchar(10) NOT NULL,
  `maHocSinh` varchar(10) NOT NULL,
  `maLop` varchar(10) NOT NULL,
  `trangThai` enum('Vắng','Có phép','Không phép') NOT NULL,
  `lyDo` varchar(255) DEFAULT NULL,
  `thoiGian` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lop`
--

CREATE TABLE `lop` (
  `maLop` varchar(10) NOT NULL,
  `tenLop` varchar(50) NOT NULL,
  `khoi` varchar(10) NOT NULL,
  `siSo` int(11) NOT NULL,
  `phongHoc` int(11) NOT NULL,
  `maGVChuNhiem` varchar(10) NOT NULL,
  `maTruong` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lop`
--

INSERT INTO `lop` (`maLop`, `tenLop`, `khoi`, `siSo`, `phongHoc`, `maGVChuNhiem`, `maTruong`) VALUES
('L001', '12A1', '12', 40, 2, 'GV001', 'T001');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `monhoc`
--

CREATE TABLE `monhoc` (
  `maMonHoc` varchar(10) NOT NULL,
  `tenMonHoc` varchar(255) NOT NULL,
  `khoiApDung` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguyenvong`
--

CREATE TABLE `nguyenvong` (
  `maNguyenVong` varchar(10) NOT NULL,
  `toHopMon` int(11) NOT NULL,
  `NV1` varchar(10) NOT NULL,
  `NV2` varchar(10) DEFAULT NULL,
  `NV3` varchar(10) DEFAULT NULL,
  `maThiSinh` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phieudanhgiahanhkiem`
--

CREATE TABLE `phieudanhgiahanhkiem` (
  `maPhieuHK` varchar(10) NOT NULL,
  `maHocSInh` varchar(10) NOT NULL,
  `nhanXet` varchar(255) NOT NULL,
  `loaiHanhKiem` enum('Giỏi','Khá','Trung bình','Yếu','Kém') NOT NULL,
  `maGiaoVien` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phieusuadiem`
--

CREATE TABLE `phieusuadiem` (
  `maPhieu` varchar(10) NOT NULL,
  `diemCu` float NOT NULL DEFAULT 0,
  `diemDeNghi` float NOT NULL DEFAULT 0,
  `lyDo` varchar(255) NOT NULL,
  `minhChung` varchar(255) NOT NULL,
  `ngayGui` date NOT NULL DEFAULT current_timestamp(),
  `trangThai` enum('Chờ duyệt','Đã duyệt','Từ chối','') NOT NULL,
  `maGV` varchar(10) NOT NULL,
  `maDiem` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phongthi`
--

CREATE TABLE `phongthi` (
  `maPhongThi` varchar(10) NOT NULL,
  `tenPhongThi` varchar(255) NOT NULL,
  `maTruong` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phuhuynh`
--

CREATE TABLE `phuhuynh` (
  `maPhuHuynh` varchar(10) NOT NULL,
  `hoTen` varchar(255) NOT NULL,
  `SDT` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ngheNghiep` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoan`
--

CREATE TABLE `taikhoan` (
  `maTaiKhoan` varchar(10) NOT NULL,
  `tenDangNhap` varchar(50) NOT NULL,
  `matKhau` varchar(255) NOT NULL,
  `loaiTaiKhoan` enum('hocsinh','giaovien','phuhuynh','giaovu','bangiamhieu','gvcn','nvso') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`maTaiKhoan`, `tenDangNhap`, `matKhau`, `loaiTaiKhoan`) VALUES
('TK001', 'hocsinh', '123', 'hocsinh'),
('TK002', 'giaovien', '123', 'giaovien'),
('TK003', 'nhanviensở', '123', 'nvso'),
('TK004', 'phuhuynh', '123', 'phuhuynh'),
('TK005', 'giaovu', '123', 'giaovu'),
('TK006', 'bangiamhieu', '123', 'bangiamhieu');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thisinh`
--

CREATE TABLE `thisinh` (
  `maThiSinh` varchar(10) NOT NULL,
  `hoTen` varchar(255) NOT NULL,
  `ngaySinh` date NOT NULL,
  `maPhuHuynh` varchar(10) NOT NULL,
  `ngayThi` datetime NOT NULL,
  `maPhongThi` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thoikhoabieu`
--

CREATE TABLE `thoikhoabieu` (
  `maTKB` varchar(10) NOT NULL,
  `tietHoc` int(11) NOT NULL,
  `maPhanCong` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tk_thongbao`
--

CREATE TABLE `tk_thongbao` (
  `maTaiKhoan` varchar(10) NOT NULL,
  `trangThai` enum('Đã đọc','Chưa đọc','','') NOT NULL,
  `maThongBao` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `truong`
--

CREATE TABLE `truong` (
  `maTruong` varchar(10) NOT NULL,
  `tenTruong` varchar(255) NOT NULL,
  `Sdt` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `diaChi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `truong`
--

INSERT INTO `truong` (`maTruong`, `tenTruong`, `Sdt`, `email`, `diaChi`) VALUES
('T001', 'THPT Thạnh Lộc', '0393898832', 'thanhloc123@gmail.com', '165 TL, Quận 12, HCM');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bailam`
--
ALTER TABLE `bailam`
  ADD PRIMARY KEY (`maBaiLam`),
  ADD KEY `maBaiTap` (`maBaiTap`);

--
-- Chỉ mục cho bảng `baitap`
--
ALTER TABLE `baitap`
  ADD PRIMARY KEY (`maBaiTap`),
  ADD KEY `maMon` (`maMon`),
  ADD KEY `maLop` (`maLop`);

--
-- Chỉ mục cho bảng `bangphancong`
--
ALTER TABLE `bangphancong`
  ADD PRIMARY KEY (`maPhanCong`),
  ADD KEY `maGV` (`maGV`),
  ADD KEY `maLop` (`maLop`),
  ADD KEY `maMonHoc` (`maMonHoc`);

--
-- Chỉ mục cho bảng `bangthongbao`
--
ALTER TABLE `bangthongbao`
  ADD PRIMARY KEY (`maThongBao`);

--
-- Chỉ mục cho bảng `cauhoi`
--
ALTER TABLE `cauhoi`
  ADD PRIMARY KEY (`maCauHoi`),
  ADD KEY `maBaiTap` (`maBaiTap`);

--
-- Chỉ mục cho bảng `cautraloi`
--
ALTER TABLE `cautraloi`
  ADD PRIMARY KEY (`maCauTraLoi`),
  ADD KEY `maBaiLam` (`maBaiLam`),
  ADD KEY `maCauHoi` (`maCauHoi`),
  ADD KEY `maDapAn` (`maDapAn`);

--
-- Chỉ mục cho bảng `chiettietdonvang`
--
ALTER TABLE `chiettietdonvang`
  ADD PRIMARY KEY (`maChiTiet`),
  ADD KEY `maDon` (`maDon`);

--
-- Chỉ mục cho bảng `chitieutuyensinh`
--
ALTER TABLE `chitieutuyensinh`
  ADD PRIMARY KEY (`maChiTieu`),
  ADD KEY `maTruong` (`maTruong`);

--
-- Chỉ mục cho bảng `dapan`
--
ALTER TABLE `dapan`
  ADD PRIMARY KEY (`maDapAn`),
  ADD KEY `maCauHoi` (`maCauHoi`);

--
-- Chỉ mục cho bảng `diem`
--
ALTER TABLE `diem`
  ADD PRIMARY KEY (`maDiem`),
  ADD KEY `maHocSinh` (`maHocSinh`),
  ADD KEY `maMonHoc` (`maMonHoc`);

--
-- Chỉ mục cho bảng `donvanghoc`
--
ALTER TABLE `donvanghoc`
  ADD PRIMARY KEY (`maDon`),
  ADD KEY `maHocSinh` (`maHocSinh`);

--
-- Chỉ mục cho bảng `giaovien`
--
ALTER TABLE `giaovien`
  ADD PRIMARY KEY (`maGV`),
  ADD KEY `maTaiKhoan` (`maTaiKhoan`);

--
-- Chỉ mục cho bảng `hocphi`
--
ALTER TABLE `hocphi`
  ADD PRIMARY KEY (`maHocPhi`),
  ADD KEY `maHocSinh` (`maHocSinh`);

--
-- Chỉ mục cho bảng `hocsinh`
--
ALTER TABLE `hocsinh`
  ADD PRIMARY KEY (`maHocSinh`),
  ADD KEY `maTaiKhoan` (`maTaiKhoan`),
  ADD KEY `maLop` (`maLop`);

--
-- Chỉ mục cho bảng `ketquaxettuyen`
--
ALTER TABLE `ketquaxettuyen`
  ADD PRIMARY KEY (`maKetQua`),
  ADD KEY `maThiSinh` (`maThiSinh`),
  ADD KEY `maTruong` (`maTruong`);

--
-- Chỉ mục cho bảng `kqdiemdanh`
--
ALTER TABLE `kqdiemdanh`
  ADD PRIMARY KEY (`maDiemDanh`),
  ADD KEY `maHocSinh` (`maHocSinh`),
  ADD KEY `maLop` (`maLop`);

--
-- Chỉ mục cho bảng `lop`
--
ALTER TABLE `lop`
  ADD PRIMARY KEY (`maLop`),
  ADD KEY `maTruong` (`maTruong`);

--
-- Chỉ mục cho bảng `monhoc`
--
ALTER TABLE `monhoc`
  ADD PRIMARY KEY (`maMonHoc`);

--
-- Chỉ mục cho bảng `nguyenvong`
--
ALTER TABLE `nguyenvong`
  ADD PRIMARY KEY (`maNguyenVong`),
  ADD KEY `NV1` (`NV1`),
  ADD KEY `NV2` (`NV2`),
  ADD KEY `NV3` (`NV3`),
  ADD KEY `maThiSinh` (`maThiSinh`);

--
-- Chỉ mục cho bảng `phieudanhgiahanhkiem`
--
ALTER TABLE `phieudanhgiahanhkiem`
  ADD PRIMARY KEY (`maPhieuHK`),
  ADD KEY `maHocSInh` (`maHocSInh`),
  ADD KEY `maGiaoVien` (`maGiaoVien`);

--
-- Chỉ mục cho bảng `phieusuadiem`
--
ALTER TABLE `phieusuadiem`
  ADD PRIMARY KEY (`maPhieu`),
  ADD KEY `maGV` (`maGV`),
  ADD KEY `maDiem` (`maDiem`);

--
-- Chỉ mục cho bảng `phongthi`
--
ALTER TABLE `phongthi`
  ADD PRIMARY KEY (`maPhongThi`),
  ADD KEY `maTruong` (`maTruong`);

--
-- Chỉ mục cho bảng `phuhuynh`
--
ALTER TABLE `phuhuynh`
  ADD PRIMARY KEY (`maPhuHuynh`);

--
-- Chỉ mục cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`maTaiKhoan`);

--
-- Chỉ mục cho bảng `thisinh`
--
ALTER TABLE `thisinh`
  ADD PRIMARY KEY (`maThiSinh`),
  ADD KEY `maPhuHuynh` (`maPhuHuynh`),
  ADD KEY `maPhongThi` (`maPhongThi`);

--
-- Chỉ mục cho bảng `tk_thongbao`
--
ALTER TABLE `tk_thongbao`
  ADD PRIMARY KEY (`maTaiKhoan`,`maThongBao`),
  ADD KEY `tk_thongbao_ibfk_2` (`maThongBao`);

--
-- Chỉ mục cho bảng `truong`
--
ALTER TABLE `truong`
  ADD PRIMARY KEY (`maTruong`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bailam`
--
ALTER TABLE `bailam`
  ADD CONSTRAINT `bailam_ibfk_1` FOREIGN KEY (`maBaiTap`) REFERENCES `baitap` (`maBaiTap`);

--
-- Các ràng buộc cho bảng `baitap`
--
ALTER TABLE `baitap`
  ADD CONSTRAINT `baitap_ibfk_1` FOREIGN KEY (`maMon`) REFERENCES `monhoc` (`maMonHoc`),
  ADD CONSTRAINT `baitap_ibfk_2` FOREIGN KEY (`maLop`) REFERENCES `lop` (`maLop`);

--
-- Các ràng buộc cho bảng `bangphancong`
--
ALTER TABLE `bangphancong`
  ADD CONSTRAINT `bangphancong_ibfk_1` FOREIGN KEY (`maGV`) REFERENCES `giaovien` (`maGV`),
  ADD CONSTRAINT `bangphancong_ibfk_2` FOREIGN KEY (`maLop`) REFERENCES `lop` (`maLop`),
  ADD CONSTRAINT `bangphancong_ibfk_3` FOREIGN KEY (`maMonHoc`) REFERENCES `monhoc` (`maMonHoc`);

--
-- Các ràng buộc cho bảng `cauhoi`
--
ALTER TABLE `cauhoi`
  ADD CONSTRAINT `cauhoi_ibfk_1` FOREIGN KEY (`maBaiTap`) REFERENCES `baitap` (`maBaiTap`);

--
-- Các ràng buộc cho bảng `cautraloi`
--
ALTER TABLE `cautraloi`
  ADD CONSTRAINT `cautraloi_ibfk_1` FOREIGN KEY (`maBaiLam`) REFERENCES `bailam` (`maBaiLam`),
  ADD CONSTRAINT `cautraloi_ibfk_2` FOREIGN KEY (`maCauHoi`) REFERENCES `cauhoi` (`maCauHoi`),
  ADD CONSTRAINT `cautraloi_ibfk_3` FOREIGN KEY (`maDapAn`) REFERENCES `dapan` (`maDapAn`);

--
-- Các ràng buộc cho bảng `chiettietdonvang`
--
ALTER TABLE `chiettietdonvang`
  ADD CONSTRAINT `chiettietdonvang_ibfk_1` FOREIGN KEY (`maDon`) REFERENCES `donvanghoc` (`maDon`);

--
-- Các ràng buộc cho bảng `chitieutuyensinh`
--
ALTER TABLE `chitieutuyensinh`
  ADD CONSTRAINT `chitieutuyensinh_ibfk_1` FOREIGN KEY (`maTruong`) REFERENCES `truong` (`maTruong`);

--
-- Các ràng buộc cho bảng `dapan`
--
ALTER TABLE `dapan`
  ADD CONSTRAINT `dapan_ibfk_1` FOREIGN KEY (`maCauHoi`) REFERENCES `cauhoi` (`maCauHoi`);

--
-- Các ràng buộc cho bảng `diem`
--
ALTER TABLE `diem`
  ADD CONSTRAINT `diem_ibfk_1` FOREIGN KEY (`maHocSinh`) REFERENCES `hocsinh` (`maHocSinh`),
  ADD CONSTRAINT `diem_ibfk_2` FOREIGN KEY (`maMonHoc`) REFERENCES `monhoc` (`maMonHoc`);

--
-- Các ràng buộc cho bảng `donvanghoc`
--
ALTER TABLE `donvanghoc`
  ADD CONSTRAINT `donvanghoc_ibfk_1` FOREIGN KEY (`maHocSinh`) REFERENCES `hocsinh` (`maHocSinh`);

--
-- Các ràng buộc cho bảng `giaovien`
--
ALTER TABLE `giaovien`
  ADD CONSTRAINT `giaovien_ibfk_1` FOREIGN KEY (`maTaiKhoan`) REFERENCES `taikhoan` (`maTaiKhoan`);

--
-- Các ràng buộc cho bảng `hocphi`
--
ALTER TABLE `hocphi`
  ADD CONSTRAINT `hocphi_ibfk_1` FOREIGN KEY (`maHocSinh`) REFERENCES `hocsinh` (`maHocSinh`);

--
-- Các ràng buộc cho bảng `hocsinh`
--
ALTER TABLE `hocsinh`
  ADD CONSTRAINT `hocsinh_ibfk_1` FOREIGN KEY (`maTaiKhoan`) REFERENCES `taikhoan` (`maTaiKhoan`),
  ADD CONSTRAINT `hocsinh_ibfk_2` FOREIGN KEY (`maLop`) REFERENCES `lop` (`maLop`);

--
-- Các ràng buộc cho bảng `ketquaxettuyen`
--
ALTER TABLE `ketquaxettuyen`
  ADD CONSTRAINT `ketquaxettuyen_ibfk_1` FOREIGN KEY (`maThiSinh`) REFERENCES `thisinh` (`maThiSinh`),
  ADD CONSTRAINT `ketquaxettuyen_ibfk_2` FOREIGN KEY (`maTruong`) REFERENCES `truong` (`maTruong`);

--
-- Các ràng buộc cho bảng `kqdiemdanh`
--
ALTER TABLE `kqdiemdanh`
  ADD CONSTRAINT `kqdiemdanh_ibfk_1` FOREIGN KEY (`maHocSinh`) REFERENCES `hocsinh` (`maHocSinh`),
  ADD CONSTRAINT `kqdiemdanh_ibfk_2` FOREIGN KEY (`maLop`) REFERENCES `lop` (`maLop`);

--
-- Các ràng buộc cho bảng `lop`
--
ALTER TABLE `lop`
  ADD CONSTRAINT `lop_ibfk_1` FOREIGN KEY (`maTruong`) REFERENCES `truong` (`maTruong`);

--
-- Các ràng buộc cho bảng `nguyenvong`
--
ALTER TABLE `nguyenvong`
  ADD CONSTRAINT `nguyenvong_ibfk_1` FOREIGN KEY (`NV1`) REFERENCES `truong` (`maTruong`),
  ADD CONSTRAINT `nguyenvong_ibfk_2` FOREIGN KEY (`NV2`) REFERENCES `truong` (`maTruong`),
  ADD CONSTRAINT `nguyenvong_ibfk_3` FOREIGN KEY (`NV3`) REFERENCES `truong` (`maTruong`),
  ADD CONSTRAINT `nguyenvong_ibfk_4` FOREIGN KEY (`maThiSinh`) REFERENCES `thisinh` (`maThiSinh`);

--
-- Các ràng buộc cho bảng `phieudanhgiahanhkiem`
--
ALTER TABLE `phieudanhgiahanhkiem`
  ADD CONSTRAINT `phieudanhgiahanhkiem_ibfk_1` FOREIGN KEY (`maHocSInh`) REFERENCES `hocsinh` (`maHocSinh`),
  ADD CONSTRAINT `phieudanhgiahanhkiem_ibfk_2` FOREIGN KEY (`maGiaoVien`) REFERENCES `giaovien` (`maGV`);

--
-- Các ràng buộc cho bảng `phieusuadiem`
--
ALTER TABLE `phieusuadiem`
  ADD CONSTRAINT `phieusuadiem_ibfk_1` FOREIGN KEY (`maGV`) REFERENCES `giaovien` (`maGV`),
  ADD CONSTRAINT `phieusuadiem_ibfk_2` FOREIGN KEY (`maDiem`) REFERENCES `diem` (`maDiem`);

--
-- Các ràng buộc cho bảng `phongthi`
--
ALTER TABLE `phongthi`
  ADD CONSTRAINT `phongthi_ibfk_1` FOREIGN KEY (`maTruong`) REFERENCES `truong` (`maTruong`);

--
-- Các ràng buộc cho bảng `thisinh`
--
ALTER TABLE `thisinh`
  ADD CONSTRAINT `thisinh_ibfk_1` FOREIGN KEY (`maPhuHuynh`) REFERENCES `phuhuynh` (`maPhuHuynh`),
  ADD CONSTRAINT `thisinh_ibfk_2` FOREIGN KEY (`maPhongThi`) REFERENCES `phongthi` (`maPhongThi`);

--
-- Các ràng buộc cho bảng `tk_thongbao`
--
ALTER TABLE `tk_thongbao`
  ADD CONSTRAINT `tk_thongbao_ibfk_1` FOREIGN KEY (`maTaiKhoan`) REFERENCES `taikhoan` (`maTaiKhoan`),
  ADD CONSTRAINT `tk_thongbao_ibfk_2` FOREIGN KEY (`maThongBao`) REFERENCES `bangthongbao` (`maThongBao`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
