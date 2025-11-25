-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 25, 2025 lúc 09:06 AM
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
-- Cơ sở dữ liệu: `ptud_1`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bailam`
--

CREATE TABLE `bailam` (
  `maBaiLam` varchar(10) NOT NULL,
  `maBaiTap` varchar(10) NOT NULL,
  `maHocSinh` varchar(10) NOT NULL,
  `ngayNop` datetime NOT NULL DEFAULT current_timestamp(),
  `fileNop` varchar(255) DEFAULT NULL,
  `diem` decimal(10,0) DEFAULT NULL,
  `trangThai` enum('Chờ chấm điểm','Đã nộp','Chưa nộp','Đã chấm điểm') NOT NULL
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

--
-- Đang đổ dữ liệu cho bảng `bangphancong`
--

INSERT INTO `bangphancong` (`maPhanCong`, `maGV`, `maLop`, `maMonHoc`, `ngayPhanCong`, `trangThai`) VALUES
('PC001', 'GV001', 'L001', 'AV12', '2025-11-18', 'Đã phân công'),
('PC002', 'GV002', 'L010', 'L10', '2025-11-18', 'Đã phân công');

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

--
-- Đang đổ dữ liệu cho bảng `chitieutuyensinh`
--

INSERT INTO `chitieutuyensinh` (`maChiTieu`, `namHoc`, `soLuong`, `maTruong`) VALUES
('CT001', '2025-2026', 300, 'T001');

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
  `maHocKy` varchar(10) NOT NULL,
  `diemMieng` float NOT NULL,
  `diem15p` float NOT NULL,
  `diem1tiet` float NOT NULL,
  `diemCK` float NOT NULL,
  `diemGK` float NOT NULL,
  `diemTK` decimal(3,1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `diem`
--

INSERT INTO `diem` (`maDiem`, `maHocSinh`, `maMonHoc`, `maHocKy`, `diemMieng`, `diem15p`, `diem1tiet`, `diemCK`, `diemGK`, `diemTK`) VALUES
('DI0476365', 'HSL00101', 'AV12', 'HK2_2025', 1, 2, 3, 5, 4, 3.6),
('DI0524807', 'HS001', 'AV12', 'HK1_2025', 8.5, 9, 8, 8, 7.5, 8.1),
('DI0557696', 'HS001', 'AV12', 'HK2_2025', 3, 3, 3, 3, 4, 3.3),
('DI0602788', 'HS001', 'L12', 'HK2_2025', 10, 10, 10, 10, 10, 10.0),
('DI0835637', 'HSL00101', 'L12', 'HK2_2025', 10, 10, 10, 10, 10, 10.0),
('DI0855447', 'HSL00101', 'AV12', 'HK1_2025', 5, 7, 4, 3, 8, 5.1);

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
  `ngayKetThuc` date NOT NULL,
  `trangThai` tinyint(4) NOT NULL,
  `SDT` varchar(15) NOT NULL,
  `maTaiKhoan` varchar(10) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `giaovien`
--

INSERT INTO `giaovien` (`maGV`, `hoTen`, `CCCD`, `diaChi`, `ngayBatDau`, `chuyenMon`, `chucVu`, `ngayKetThuc`, `trangThai`, `SDT`, `maTaiKhoan`, `email`) VALUES
('GV001', 'Nguyễn Văn Test Updated', 2147483647, '123 Đường ABC Updated, Quận 1, TP.HCM', '2025-01-01', 'Toán - Tin học', 'GVCN', '2025-11-07', 1, '0901234567', 'TK007', 'nguyenvantestupdated@gmail.com'),
('GV002', 'Nguyễn Test', 1234567012, '123 Đường ABC, Quận 1, TP.HCM', '2025-01-01', 'Sinh', 'GVCN', '0000-00-00', 1, '0901234567', 'TK008', 'nguyenvantest@gmail.com'),
('GV003', 'Trần Văn Minh', 2147483647, '456 Đường Lê Lợi, Quận 3, TP.HCM', '2025-01-15', 'Toán', 'GVCN', '0000-00-00', 1, '0909123456', 'TK009', 'tranvanminh@gmail.com'),
('GV004', 'Trần Thị Bình Thăng Chức', 2147483647, '456 Đường Nguyễn Huệ Updated, Quận 3, TP.HCM', '2024-01-15', 'Văn - GDCD', 'GVCN', '0000-00-00', 1, '0907654321', 'TK010', 'tranthibinhgvcn@gmail.com'),
('GV005', 'Nguyễn Văn An', 2147483647, '123 Đường Lê Lợi, Quận 1, TP.HCM', '2023-08-15', 'Toán', 'GVCN', '0000-00-00', 1, '0901234567', 'TK011', 'nguyenvanan@gmail.com'),
('GV006', 'Lê Minh Châu', 2147483647, '789 Đường Hai Bà Trưng, Quận 5, TP.HCM', '2024-01-10', 'Tiếng Anh', 'GVCN', '0000-00-00', 1, '0912345678', 'TK012', 'leminhchau@gmail.com'),
('GV007', 'Phạm Thị Dung', 2147483647, '321 Đường Trần Hưng Đạo, Quận 10, TP.HCM', '2023-03-20', 'Lý', 'GVCN', '0000-00-00', 1, '0923456789', 'TK013', 'phamthidung@gmail.com'),
('GV008', 'Phạm Thị Du', 2147483647, '321 Đường Trần Hưng Đạo, Quận 10, TP.HCM', '2023-03-20', 'Lý', 'GVBM', '0000-00-00', 1, '0923456789', 'TK014', 'phamthidung@gmail.com'),
('GV009', 'Phạm Thị Du', 2147483647, '321 Đường Trần Hưng Đạo, Quận 10, TP.HCM', '2023-03-20', 'Lý', 'GVBM', '2025-11-07', 0, '0923456789', 'TK015', 'phamthidung@gmail.com'),
('GV010', 'Phạm Thị Dung', 2147483647, '321 Đường Trần Hưng Đạo, Quận 10, TP.HCM', '2023-03-20', 'Lý', 'GVBM', '2025-11-07', 0, '0923456789', 'TK016', 'phamthidung@gmail.com'),
('GV011', 'Nguyễn Thị Hồng', 1234567890, '12 Đường 3/2, Q.10, TP.HCM', '2025-08-01', 'Toán', 'GVCN', '0000-00-00', 1, '0901111111', 'TK017', 'hongnguyen10a1@gmail.com'),
('GV012', 'Lê Văn Hùng', 1234567891, '34 Đường Lê Lai, Q.1, TP.HCM', '2025-08-01', 'Văn', 'GVCN', '0000-00-00', 1, '0902222222', 'TK018', 'hunghung11a1@gmail.com'),
('GV013', 'Trần Thị Mai', 1234567892, '56 Đường Nguyễn Trãi, Q.5, TP.HCM', '2025-08-01', 'Anh', 'GVCN', '0000-00-00', 1, '0903333333', 'TK019', 'maitran12a1@gmail.com'),
('GV014', 'Lê Thị Hiền', 123456789, '789 Đường Hai Bà Trưng, Quận 4, TP.HCM', '2024-01-10', 'Lịch Sử', 'GVBM', '2025-11-19', 0, '0912345678', 'TKGV001', 'lethihien@gmail.com');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hocky`
--

CREATE TABLE `hocky` (
  `maHocKy` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenHocKy` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `namHoc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hocky`
--

INSERT INTO `hocky` (`maHocKy`, `tenHocKy`, `namHoc`) VALUES
('HK1_2025', 'Học kì 1', '2024-2025'),
('HK2_2025', 'Học kì 2', '2024-2025');

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
  `maPhuHuynh` varchar(10) DEFAULT NULL,
  `diaChi` varchar(255) NOT NULL,
  `tinhTrang` enum('Đang học','Bảo lưu','Tốt nghiệp','Nghỉ học') NOT NULL,
  `anhChanDung` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hocsinh`
--

INSERT INTO `hocsinh` (`maHocSinh`, `hoTen`, `ngaySinh`, `gioiTinh`, `namHoc`, `maLop`, `maTaiKhoan`, `maPhuHuynh`, `diaChi`, `tinhTrang`, `anhChanDung`) VALUES
('HS001', 'Dương Bảo', '2015-11-03', 'Nam', '2022-2025', 'L001', 'TK001', 'PH001', '', 'Đang học', ''),
('HS321', 'Nguyễn Văn', '2008-05-01', 'Nam', '2024-2025', 'L010', 'TK003', NULL, 'Hà Nội', 'Đang học', ''),
('HSL00101', 'Nguyễn Văn 12A1-01', '2010-01-01', 'Nam', '2022-2025', 'L001', 'TKHSL00101', NULL, 'Q.12', 'Đang học', ''),
('HSL00102', 'Nguyễn Văn 12A1-02', '2010-01-02', 'Nữ', '2022-2025', 'L001', 'TKHSL00102', NULL, 'Q.12', 'Đang học', ''),
('HSL00103', 'Nguyễn Văn 12A1-03', '2010-01-03', 'Nam', '2022-2025', 'L001', 'TKHSL00103', NULL, 'Q.12', 'Đang học', ''),
('HSL00104', 'Nguyễn Văn 12A1-04', '2010-01-04', 'Nữ', '2022-2025', 'L001', 'TKHSL00104', NULL, 'Q.12', 'Đang học', ''),
('HSL00105', 'Nguyễn Văn 12A1-05', '2010-01-05', 'Nam', '2022-2025', 'L001', 'TKHSL00105', NULL, 'Q.12', 'Đang học', ''),
('HSL00106', 'Nguyễn Văn 12A1-06', '2010-01-06', 'Nữ', '2022-2025', 'L001', 'TKHSL00106', NULL, 'Q.12', 'Đang học', ''),
('HSL00107', 'Nguyễn Văn 12A1-07', '2010-01-07', 'Nam', '2022-2025', 'L001', 'TKHSL00107', NULL, 'Q.12', 'Đang học', ''),
('HSL00108', 'Nguyễn Văn 12A1-08', '2010-01-08', 'Nữ', '2022-2025', 'L001', 'TKHSL00108', NULL, 'Q.12', 'Đang học', ''),
('HSL00109', 'Nguyễn Văn 12A1-09', '2010-01-09', 'Nam', '2022-2025', 'L001', 'TKHSL00109', NULL, 'Q.12', 'Đang học', ''),
('HSL00110', 'Nguyễn Văn 12A1-10', '2010-01-10', 'Nữ', '2022-2025', 'L001', 'TKHSL00110', NULL, 'Q.12', 'Đang học', ''),
('HSL01001', 'Nguyễn Văn 10A1-01', '2011-01-01', 'Nam', '2022-2025', 'L010', 'TKHSL01001', NULL, 'Q.12', 'Đang học', ''),
('HSL01002', 'Nguyễn Văn 10A1-02', '2011-01-02', 'Nữ', '2022-2025', 'L010', 'TKHSL01002', NULL, 'Q.12', 'Đang học', ''),
('HSL01003', 'Nguyễn Văn 10A1-03', '2011-01-03', 'Nam', '2022-2025', 'L010', 'TKHSL01003', NULL, 'Q.12', 'Đang học', ''),
('HSL01004', 'Nguyễn Văn 10A1-04', '2011-01-04', 'Nữ', '2022-2025', 'L010', 'TKHSL01004', NULL, 'Q.12', 'Đang học', ''),
('HSL01005', 'Nguyễn Văn 10A1-05', '2011-01-05', 'Nam', '2022-2025', 'L010', 'TKHSL01005', NULL, 'Q.12', 'Đang học', ''),
('HSL01006', 'Nguyễn Văn 10A1-06', '2011-01-06', 'Nữ', '2022-2025', 'L010', 'TKHSL01006', NULL, 'Q.12', 'Đang học', ''),
('HSL01007', 'Nguyễn Văn 10A1-07', '2011-01-07', 'Nam', '2022-2025', 'L010', 'TKHSL01007', NULL, 'Q.12', 'Đang học', ''),
('HSL01008', 'Nguyễn Văn 10A1-08', '2011-01-08', 'Nữ', '2022-2025', 'L010', 'TKHSL01008', NULL, 'Q.12', 'Đang học', ''),
('HSL01009', 'Nguyễn Văn 10A1-09', '2011-01-09', 'Nam', '2022-2025', 'L010', 'TKHSL01009', NULL, 'Q.12', 'Đang học', ''),
('HSL01010', 'Nguyễn Văn 10A1-10', '2011-01-10', 'Nữ', '2022-2025', 'L010', 'TKHSL01010', NULL, 'Q.12', 'Đang học', ''),
('HSL01101', 'Nguyễn Văn 10A2-01', '2011-02-01', 'Nam', '2022-2025', 'L011', 'TKHSL01101', NULL, 'Q.12', 'Đang học', ''),
('HSL01102', 'Nguyễn Văn 10A2-02', '2011-02-02', 'Nữ', '2022-2025', 'L011', 'TKHSL01102', NULL, 'Q.12', 'Đang học', ''),
('HSL01103', 'Nguyễn Văn 10A2-03', '2011-02-03', 'Nam', '2022-2025', 'L011', 'TKHSL01103', NULL, 'Q.12', 'Đang học', ''),
('HSL01104', 'Nguyễn Văn 10A2-04', '2011-02-04', 'Nữ', '2022-2025', 'L011', 'TKHSL01104', NULL, 'Q.12', 'Đang học', ''),
('HSL01105', 'Nguyễn Văn 10A2-05', '2011-02-05', 'Nam', '2022-2025', 'L011', 'TKHSL01105', NULL, 'Q.12', 'Đang học', ''),
('HSL01106', 'Nguyễn Văn 10A2-06', '2011-02-06', 'Nữ', '2022-2025', 'L011', 'TKHSL01106', NULL, 'Q.12', 'Đang học', ''),
('HSL01107', 'Nguyễn Văn 10A2-07', '2011-02-07', 'Nam', '2022-2025', 'L011', 'TKHSL01107', NULL, 'Q.12', 'Đang học', ''),
('HSL01108', 'Nguyễn Văn 10A2-08', '2011-02-08', 'Nữ', '2022-2025', 'L011', 'TKHSL01108', NULL, 'Q.12', 'Đang học', ''),
('HSL01109', 'Nguyễn Văn 10A2-09', '2011-02-09', 'Nam', '2022-2025', 'L011', 'TKHSL01109', NULL, 'Q.12', 'Đang học', ''),
('HSL01110', 'Nguyễn Văn 10A2-10', '2011-02-10', 'Nữ', '2022-2025', 'L011', 'TKHSL01110', NULL, 'Q.12', 'Đang học', ''),
('HSL11001', 'Nguyễn Văn 11A1-01', '2010-03-01', 'Nam', '2022-2025', 'L110', 'TKHSL11001', NULL, 'Q.12', 'Đang học', ''),
('HSL11002', 'Nguyễn Văn 11A1-02', '2010-03-02', 'Nữ', '2022-2025', 'L110', 'TKHSL11002', NULL, 'Q.12', 'Đang học', ''),
('HSL11003', 'Nguyễn Văn 11A1-03', '2010-03-03', 'Nam', '2022-2025', 'L110', 'TKHSL11003', NULL, 'Q.12', 'Đang học', ''),
('HSL11004', 'Nguyễn Văn 11A1-04', '2010-03-04', 'Nữ', '2022-2025', 'L110', 'TKHSL11004', NULL, 'Q.12', 'Đang học', ''),
('HSL11005', 'Nguyễn Văn 11A1-05', '2010-03-05', 'Nam', '2022-2025', 'L110', 'TKHSL11005', NULL, 'Q.12', 'Đang học', ''),
('HSL11006', 'Nguyễn Văn 11A1-06', '2010-03-06', 'Nữ', '2022-2025', 'L110', 'TKHSL11006', NULL, 'Q.12', 'Đang học', ''),
('HSL11007', 'Nguyễn Văn 11A1-07', '2010-03-07', 'Nam', '2022-2025', 'L110', 'TKHSL11007', NULL, 'Q.12', 'Đang học', ''),
('HSL11008', 'Nguyễn Văn 11A1-08', '2010-03-08', 'Nữ', '2022-2025', 'L110', 'TKHSL11008', NULL, 'Q.12', 'Đang học', ''),
('HSL11101', 'Nguyễn Văn 11A2-01', '2010-04-01', 'Nam', '2022-2025', 'L111', 'TKHSL11101', NULL, 'Q.12', 'Đang học', ''),
('HSL11102', 'Nguyễn Văn 11A2-02', '2010-04-02', 'Nữ', '2022-2025', 'L111', 'TKHSL11102', NULL, 'Q.12', 'Đang học', ''),
('HSL11103', 'Nguyễn Văn 11A2-03', '2010-04-03', 'Nam', '2022-2025', 'L111', 'TKHSL11103', NULL, 'Q.12', 'Đang học', ''),
('HSL11104', 'Nguyễn Văn 11A2-04', '2010-04-04', 'Nữ', '2022-2025', 'L111', 'TKHSL11104', NULL, 'Q.12', 'Đang học', ''),
('HSL11105', 'Nguyễn Văn 11A2-05', '2010-04-05', 'Nam', '2022-2025', 'L111', 'TKHSL11105', NULL, 'Q.12', 'Đang học', ''),
('HSL11106', 'Nguyễn Văn 11A2-06', '2010-04-06', 'Nữ', '2022-2025', 'L111', 'TKHSL11106', NULL, 'Q.12', 'Đang học', ''),
('HSL11107', 'Nguyễn Văn 11A2-07', '2010-04-07', 'Nam', '2022-2025', 'L111', 'TKHSL11107', NULL, 'Q.12', 'Đang học', ''),
('HSL21001', 'Nguyễn Văn 12A2-01', '2010-05-01', 'Nam', '2022-2025', 'L210', 'TKHSL21001', NULL, 'Q.12', 'Đang học', ''),
('HSL21002', 'Nguyễn Văn 12A2-02', '2010-05-02', 'Nữ', '2022-2025', 'L210', 'TKHSL21002', NULL, 'Q.12', 'Đang học', ''),
('HSL21003', 'Nguyễn Văn 12A2-03', '2010-05-03', 'Nam', '2022-2025', 'L210', 'TKHSL21003', NULL, 'Q.12', 'Đang học', ''),
('HSL21004', 'Nguyễn Văn 12A2-04', '2010-05-04', 'Nữ', '2022-2025', 'L210', 'TKHSL21004', NULL, 'Q.12', 'Đang học', ''),
('HSL21005', 'Nguyễn Văn 12A2-05', '2010-05-05', 'Nam', '2022-2025', 'L210', 'TKHSL21005', NULL, 'Q.12', 'Đang học', ''),
('HSL21006', 'Nguyễn Văn 12A2-06', '2010-05-06', 'Nữ', '2022-2025', 'L210', 'TKHSL21006', NULL, 'Q.12', 'Đang học', ''),
('HSL21007', 'Nguyễn Văn 12A2-07', '2010-05-07', 'Nam', '2022-2025', 'L210', 'TKHSL21007', NULL, 'Q.12', 'Đang học', ''),
('HSL21008', 'Nguyễn Văn 12A2-08', '2010-05-08', 'Nữ', '2022-2025', 'L210', 'TKHSL21008', NULL, 'Q.12', 'Đang học', ''),
('HSL21009', 'Nguyễn Văn 12A2-09', '2010-05-09', 'Nam', '2022-2025', 'L210', 'TKHSL21009', NULL, 'Q.12', 'Đang học', ''),
('HSL21010', 'Nguyễn Văn 12A2-10', '2010-05-10', 'Nữ', '2022-2025', 'L210', 'TKHSL21010', NULL, 'Q.12', 'Đang học', ''),
('HSL21101', 'Nguyễn Văn 12A3-01', '2010-06-01', 'Nam', '2022-2025', 'L211', 'TKHSL21101', NULL, 'Q.12', 'Đang học', ''),
('HSL21102', 'Nguyễn Văn 12A3-02', '2010-06-02', 'Nữ', '2022-2025', 'L211', 'TKHSL21102', NULL, 'Q.12', 'Đang học', ''),
('HSL21103', 'Nguyễn Văn 12A3-03', '2010-06-03', 'Nam', '2022-2025', 'L211', 'TKHSL21103', NULL, 'Q.12', 'Đang học', ''),
('HSL21104', 'Nguyễn Văn 12A3-04', '2010-06-04', 'Nữ', '2022-2025', 'L211', 'TKHSL21104', NULL, 'Q.12', 'Đang học', ''),
('HSL21105', 'Nguyễn Văn 12A3-05', '2010-06-05', 'Nam', '2022-2025', 'L211', 'TKHSL21105', NULL, 'Q.12', 'Đang học', ''),
('HSL21106', 'Nguyễn Văn 12A3-06', '2010-06-06', 'Nữ', '2022-2025', 'L211', 'TKHSL21106', NULL, 'Q.12', 'Đang học', ''),
('HSL21107', 'Nguyễn Văn 12A3-07', '2010-06-07', 'Nam', '2022-2025', 'L211', 'TKHSL21107', NULL, 'Q.12', 'Đang học', ''),
('HSL21108', 'Nguyễn Văn 12A3-08', '2010-06-08', 'Nữ', '2022-2025', 'L211', 'TKHSL21108', NULL, 'Q.12', 'Đang học', ''),
('HSL21109', 'Nguyễn Văn 12A3-09', '2010-06-09', 'Nam', '2022-2025', 'L211', 'TKHSL21109', NULL, 'Q.12', 'Đang học', ''),
('HSL21110', 'Nguyễn Văn 12A3-10', '2010-06-10', 'Nữ', '2022-2025', 'L211', 'TKHSL21110', NULL, 'Q.12', 'Đang học', ''),
('HSL21111', 'Nguyễn Văn 12A3-11', '2010-06-11', 'Nam', '2022-2025', 'L211', 'TKHSL21111', NULL, 'Q.12', 'Đang học', '');

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

--
-- Đang đổ dữ liệu cho bảng `kqdiemdanh`
--

INSERT INTO `kqdiemdanh` (`maDiemDanh`, `maHocSinh`, `maLop`, `trangThai`, `lyDo`, `thoiGian`) VALUES
('DD17635433', 'HS001', 'L001', 'Có phép', 'Ốm', '2025-11-19 16:54:24'),
('DD17635444', 'HS001', 'L001', 'Vắng', NULL, '2025-11-19 16:27:43');

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
('L001', '12A1', '12', 10, 2, 'GV001', 'T001'),
('L010', '10A1', '10', 10, 1, 'GV002', 'T001'),
('L011', '10A2', '10', 10, 2, 'GV003', 'T001'),
('L110', '11A1', '11', 8, 3, 'GV004', 'T001'),
('L111', '11A2', '11', 7, 4, 'GV005', 'T001'),
('L210', '12A2', '12', 10, 5, 'GV006', 'T001'),
('L211', '12A3', '12', 11, 6, 'GV007', 'T001');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `monhoc`
--

CREATE TABLE `monhoc` (
  `maMonHoc` varchar(10) NOT NULL,
  `tenMonHoc` varchar(255) NOT NULL,
  `khoiApDung` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `monhoc`
--

INSERT INTO `monhoc` (`maMonHoc`, `tenMonHoc`, `khoiApDung`) VALUES
('AV10', 'Tiếng Anh', 10),
('AV11', 'Tiếng Anh', 11),
('AV12', 'Tiếng Anh', 12),
('L10', 'Vật Lý', 10),
('L11', 'Vật Lý', 11),
('L12', 'Vật Lý', 12),
('T10', 'Toán', 10),
('T11', 'Toán', 11),
('T12', 'Toán', 12),
('V10', 'Ngữ Văn', 10),
('V11', 'Ngữ Văn', 11),
('V12', 'Ngữ Văn', 12);

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
  `maGiaoVien` varchar(10) NOT NULL,
  `maHocKy` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phieudanhgiahanhkiem`
--

INSERT INTO `phieudanhgiahanhkiem` (`maPhieuHK`, `maHocSInh`, `nhanXet`, `loaiHanhKiem`, `maGiaoVien`, `maHocKy`) VALUES
('PHK1763612', 'HS001', 'Hay nói chuyện trong giờ.', 'Trung bình', 'GV001', 'HK1_2025');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phieusuadiem`
--

CREATE TABLE `phieusuadiem` (
  `maPhieu` varchar(10) NOT NULL,
  `diemCu` float NOT NULL DEFAULT 0,
  `diemDeNghi` float NOT NULL DEFAULT 0,
  `loaiDiem` enum('diem15p','diem1tiet','diemCK','diemGK','diemMieng') NOT NULL,
  `lyDo` varchar(255) NOT NULL,
  `minhChung` varchar(255) NOT NULL,
  `ngayGui` date NOT NULL DEFAULT current_timestamp(),
  `trangThai` enum('Chờ duyệt','Đã duyệt','Từ chối','') NOT NULL,
  `maGV` varchar(10) NOT NULL,
  `maDiem` varchar(10) NOT NULL,
  `maHocKy` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phieusuadiem`
--

INSERT INTO `phieusuadiem` (`maPhieu`, `diemCu`, `diemDeNghi`, `loaiDiem`, `lyDo`, `minhChung`, `ngayGui`, `trangThai`, `maGV`, `maDiem`, `maHocKy`) VALUES
('PSD1763615', 7, 8.5, 'diem15p', 'Nhập nhầm điểm của em này với em khác', 'Link ảnh bài kiểm tra hoặc tên file ảnh', '2025-11-20', 'Chờ duyệt', 'GV001', 'DI0855447', 'HK1_2025');

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
  `ngheNghiep` varchar(255) NOT NULL,
  `maTaiKhoan` varchar(10) DEFAULT NULL COMMENT 'Khóa ngoại liên kết với bảng taikhoan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phuhuynh`
--

INSERT INTO `phuhuynh` (`maPhuHuynh`, `hoTen`, `SDT`, `email`, `ngheNghiep`, `maTaiKhoan`) VALUES
('PH001', 'Nguyễn Văn A', '0901234567', 'phuhuynh01@gmail.com', 'Kinh doanh', 'TKPH001');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoan`
--

CREATE TABLE `taikhoan` (
  `maTaiKhoan` varchar(10) NOT NULL,
  `tenDangNhap` varchar(50) NOT NULL,
  `matKhau` varchar(255) NOT NULL,
  `loaiTaiKhoan` enum('hocsinh','giaovien','phuhuynh','giaovu','bangiamhieu','gvcn','nvso') NOT NULL,
  `isDefaultPassword` tinyint(1) DEFAULT 1 COMMENT 'Đánh dấu tài khoản đang dùng mật khẩu mặc định (1: mặc định, 0: đã đổi)',
  `lastLogin` datetime DEFAULT NULL COMMENT 'Thời gian đăng nhập cuối cùng',
  `isActive` tinyint(1) DEFAULT 1 COMMENT 'Trạng thái tài khoản (1: hoạt động, 0: bị vô hiệu hóa)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`maTaiKhoan`, `tenDangNhap`, `matKhau`, `loaiTaiKhoan`, `isDefaultPassword`, `lastLogin`, `isActive`) VALUES
('TK001', 'hocsinhBao', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, '2025-11-25 13:17:22', 1),
('TK003', 'nhanvienso', '2b2b7f6d7f578456dde7b92e36584994', 'nvso', 1, '2025-11-19 10:38:47', 1),
('TK005', 'giaovu', '2b2b7f6d7f578456dde7b92e36584994', 'giaovu', 1, '2025-11-25 13:20:03', 1),
('TK006', 'bangiamhieu', '2b2b7f6d7f578456dde7b92e36584994', 'bangiamhieu', 1, '2025-11-25 13:24:24', 1),
('TK007', 'gv_nguyenvantest_4794', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, '2025-11-25 13:22:50', 1),
('TK008', 'gv_nguyentest_9087', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, '2025-11-19 18:10:10', 1),
('TK009', 'gv_tranvanminh_7516', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, '2025-11-19 18:13:18', 1),
('TK010', 'gv_tranthibinhthangchuc_3005', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, '2025-11-19 18:14:30', 1),
('TK011', 'gv_nguyenvanan_8708', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, NULL, 1),
('TK012', 'gv_leminhchau_4465', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, NULL, 1),
('TK013', 'gv_phamthidung_7179', '2b2b7f6d7f578456dde7b92e36584994', 'gvcn', 1, NULL, 1),
('TK014', 'gv_phamthidu_5073', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, NULL, 1),
('TK015', 'gv_phamthidu_4838', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, NULL, 0),
('TK016', 'gv_phamthidu_2473', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, NULL, 0),
('TK017', 'gv_nguyenthihong', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, NULL, 1),
('TK018', 'gv_levanhung', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, NULL, 1),
('TK019', 'gv_tranthimai', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, NULL, 1),
('TKGV001', 'lethihien', '2b2b7f6d7f578456dde7b92e36584994', 'giaovien', 1, '2025-11-19 11:27:28', 0),
('TKHSL00101', 'hs12a1_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00102', 'hs12a1_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00103', 'hs12a1_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00104', 'hs12a1_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00105', 'hs12a1_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00106', 'hs12a1_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00107', 'hs12a1_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00108', 'hs12a1_08', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00109', 'hs12a1_09', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL00110', 'hs12a1_10', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01001', 'hs10a1_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01002', 'hs10a1_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01003', 'hs10a1_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01004', 'hs10a1_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01005', 'hs10a1_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01006', 'hs10a1_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01007', 'hs10a1_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01008', 'hs10a1_08', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01009', 'hs10a1_09', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01010', 'hs10a1_10', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01101', 'hs10a2_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01102', 'hs10a2_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01103', 'hs10a2_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01104', 'hs10a2_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01105', 'hs10a2_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01106', 'hs10a2_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01107', 'hs10a2_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01108', 'hs10a2_08', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01109', 'hs10a2_09', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL01110', 'hs10a2_10', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11001', 'hs11a1_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11002', 'hs11a1_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11003', 'hs11a1_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11004', 'hs11a1_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11005', 'hs11a1_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11006', 'hs11a1_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11007', 'hs11a1_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11008', 'hs11a1_08', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11101', 'hs11a2_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11102', 'hs11a2_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11103', 'hs11a2_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11104', 'hs11a2_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11105', 'hs11a2_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11106', 'hs11a2_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL11107', 'hs11a2_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21001', 'hs12a2_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21002', 'hs12a2_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21003', 'hs12a2_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21004', 'hs12a2_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21005', 'hs12a2_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21006', 'hs12a2_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21007', 'hs12a2_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21008', 'hs12a2_08', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21009', 'hs12a2_09', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21010', 'hs12a2_10', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21101', 'hs12a3_01', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21102', 'hs12a3_02', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21103', 'hs12a3_03', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21104', 'hs12a3_04', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21105', 'hs12a3_05', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21106', 'hs12a3_06', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21107', 'hs12a3_07', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21108', 'hs12a3_08', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21109', 'hs12a3_09', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21110', 'hs12a3_10', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKHSL21111', 'hs12a3_11', '2b2b7f6d7f578456dde7b92e36584994', 'hocsinh', 1, NULL, 1),
('TKPH001', 'phuhuynh', '2b2b7f6d7f578456dde7b92e36584994', 'phuhuynh', 1, '2025-11-19 10:35:22', 1);

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
  ADD KEY `maBaiTap` (`maBaiTap`),
  ADD KEY `maHocSinh` (`maHocSinh`);

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
  ADD KEY `maMonHoc` (`maMonHoc`),
  ADD KEY `maHocKy` (`maHocKy`);

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
-- Chỉ mục cho bảng `hocky`
--
ALTER TABLE `hocky`
  ADD PRIMARY KEY (`maHocKy`);

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
  ADD KEY `maTruong` (`maTruong`),
  ADD KEY `fk_lop_giaovien_chunhiem` (`maGVChuNhiem`);

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
  ADD KEY `maGiaoVien` (`maGiaoVien`),
  ADD KEY `maHocKy` (`maHocKy`);

--
-- Chỉ mục cho bảng `phieusuadiem`
--
ALTER TABLE `phieusuadiem`
  ADD PRIMARY KEY (`maPhieu`),
  ADD KEY `maGV` (`maGV`),
  ADD KEY `maDiem` (`maDiem`),
  ADD KEY `maHocKy` (`maHocKy`);

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
  ADD PRIMARY KEY (`maPhuHuynh`),
  ADD KEY `fk_phuhuynh_taikhoan` (`maTaiKhoan`);

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
  ADD CONSTRAINT `bailam_ibfk_1` FOREIGN KEY (`maBaiTap`) REFERENCES `baitap` (`maBaiTap`),
  ADD CONSTRAINT `bailam_ibfk_2` FOREIGN KEY (`maHocSinh`) REFERENCES `hocsinh` (`maHocSinh`);

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
  ADD CONSTRAINT `diem_ibfk_2` FOREIGN KEY (`maMonHoc`) REFERENCES `monhoc` (`maMonHoc`),
  ADD CONSTRAINT `diem_ibfk_3` FOREIGN KEY (`maHocKy`) REFERENCES `hocky` (`maHocKy`);

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
  ADD CONSTRAINT `fk_lop_giaovien_chunhiem` FOREIGN KEY (`maGVChuNhiem`) REFERENCES `giaovien` (`maGV`) ON UPDATE CASCADE,
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
  ADD CONSTRAINT `phieudanhgiahanhkiem_ibfk_2` FOREIGN KEY (`maGiaoVien`) REFERENCES `giaovien` (`maGV`),
  ADD CONSTRAINT `phieudanhgiahanhkiem_ibfk_3` FOREIGN KEY (`maHocKy`) REFERENCES `hocky` (`maHocKy`);

--
-- Các ràng buộc cho bảng `phieusuadiem`
--
ALTER TABLE `phieusuadiem`
  ADD CONSTRAINT `phieusuadiem_ibfk_1` FOREIGN KEY (`maGV`) REFERENCES `giaovien` (`maGV`),
  ADD CONSTRAINT `phieusuadiem_ibfk_2` FOREIGN KEY (`maDiem`) REFERENCES `diem` (`maDiem`),
  ADD CONSTRAINT `phieusuadiem_ibfk_3` FOREIGN KEY (`maHocKy`) REFERENCES `hocky` (`maHocKy`);

--
-- Các ràng buộc cho bảng `phongthi`
--
ALTER TABLE `phongthi`
  ADD CONSTRAINT `phongthi_ibfk_1` FOREIGN KEY (`maTruong`) REFERENCES `truong` (`maTruong`);

--
-- Các ràng buộc cho bảng `phuhuynh`gggg
--
ALTER TABLE `phuhuynh`
  ADD CONSTRAINT `phuhuynh_ibfk_1` FOREIGN KEY (`maTaiKhoan`) REFERENCES `taikhoan` (`maTaiKhoan`) ON DELETE SET NULL ON UPDATE CASCADE;

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
