
# Tài Liệu Yêu Cầu Dự Án
**Dự án:** Trình Theo Dõi Dự Án (Project Tracker)  
**Ngày tạo:** 26/07/2024  
**Phiên bản:** 1.0

---

### 1. Tổng Quan Dự Án (Project Overview)

#### 1.1. Bối Cảnh
Hiện tại, việc theo dõi các dự án và công việc tại công ty được thực hiện thủ công qua Excel, email, và các cuộc họp. Quy trình này dẫn đến thông tin phân mảnh, khó khăn trong việc tổng hợp tiến độ, và tốn thời gian tạo báo cáo.

#### 1.2. Vấn Đề Hiện Tại
- **Thông tin không tập trung:** Dữ liệu dự án và công việc nằm rải rác.
- **Khó theo dõi tiến độ:** Thiếu một cái nhìn tổng quan, real-time về trạng thái dự án.
- **Tốn thời gian báo cáo:** Việc tổng hợp dữ liệu để tạo báo cáo tuần rất tốn công sức.

#### 1.3. Mục Tiêu Dự Án
Xây dựng một ứng dụng web tập trung (Project Tracker) để quản lý và theo dõi toàn bộ dự án và công việc, đồng bộ trực tiếp từ Microsoft Dataverse.

#### 1.4. Mục Tiêu Cải Thiện
- **Tập trung hóa dữ liệu:** Quản lý thông tin tại một nơi duy nhất.
- **Minh bạch hóa tiến độ:** Cung cấp Dashboard giúp các bên liên quan dễ dàng nắm bắt tình hình.
- **Tự động hóa báo cáo:** Tích hợp AI (Gemini) để tự động tạo báo cáo công việc tuần.
- **Tăng hiệu quả quản lý:** Giao diện trực quan giúp Admin dễ dàng phân công và quản lý công việc.

---

### 2. Yêu Cầu Nghiệp Vụ (Business Requirements - BRD)

| ID | Yêu Cầu Nghiệp Vụ | Mô Tả Chi Tiết | Lợi Ích Mong Đợi |
| :--- | :--- | :--- | :--- |
| BR-01 | Quản lý và xem danh sách dự án | Hệ thống phải hiển thị danh sách tất cả các dự án, được phân loại theo trạng thái (Đang hoạt động, Bảo trì, Kế hoạch). | Dễ dàng nắm bắt tổng quan các dự án. |
| BR-02 | Xem chi tiết thông tin dự án | Người dùng có thể xem thông tin chi tiết của một dự án, bao gồm mô tả, tiến độ, người liên quan, và tài liệu. | Hiểu rõ bối cảnh và tình trạng của từng dự án. |
| BR-03 | Quản lý công việc (Task) | Hệ thống cho phép xem, thêm, sửa đổi thông tin các công việc trong một dự án. | Quản lý chi tiết các đầu việc, phân công rõ ràng. |
| BR-04 | Phân quyền truy cập | Chỉ Admin mới có quyền tạo và chỉnh sửa. Người dùng thường chỉ có quyền xem. | Đảm bảo tính toàn vẹn và bảo mật dữ liệu. |
| BR-05 | Tạo báo cáo công việc tự động | Hệ thống phải có chức năng sử dụng AI để tạo báo cáo công việc hàng tuần. | Tiết kiệm thời gian, chuẩn hóa quy trình báo cáo. |

---

### 3. Yêu Cầu Hệ Thống (System Requirements Specification - SRS)

#### 3.1. Yêu Cầu Chức Năng (Functional Requirements)

| ID | Chức Năng | Mô Tả Chi Tiết |
| :--- | :--- | :--- |
| FC-01 | Đăng nhập/Đăng xuất | Admin có thể đăng nhập bằng cách chọn tên và nhập mật khẩu để có quyền chỉnh sửa. |
| FC-02 | Hiển thị Dashboard | Hiển thị màn hình tổng quan với các thông tin chính và danh sách các dự án đang hoạt động. |
| FC-03 | Phân loại và lọc dự án | Danh sách dự án ở menu bên trái được phân loại theo `ACTIVE`, `MAINTENANCE`, `PLANNED`. |
| FC-04 | Xem chi tiết dự án | Khi chọn một dự án, màn hình hiển thị đầy đủ thông tin chi tiết, tiến độ, và danh sách công việc. |
| FC-05 | Thêm/Sửa công việc (Admin) | Admin có thể thêm công việc mới hoặc chỉnh sửa một công việc hiện có thông qua form modal. |
| FC-06 | Tạo báo cáo AI (Admin) | Admin có thể mở chức năng tạo báo cáo, chọn nhân sự, khoảng thời gian để AI tổng hợp và tạo báo cáo HTML. |

#### 3.2. Yêu Cầu Phi Chức Năng (Non-functional Requirements)

| ID | Yêu Cầu | Mô Tả Chi Tiết |
| :--- | :--- | :--- |
| NFC-01 | Hiệu Năng | Thời gian tải trang lần đầu phải dưới 3 giây. |
| NFC-02 | Giao Diện Người Dùng | Giao diện đáp ứng (responsive), hiển thị tốt trên desktop và mobile. Thiết kế theo phong cách dark mode. |
| NFC-03 | Tính Sẵn Sàng | Dữ liệu được lấy trực tiếp từ Dataverse, đảm bảo tính đồng bộ của thông tin. |

---

### 4. Use Case và User Story

#### 4.1. Danh sách
- **UC-01:** Admin cập nhật tiến độ công việc.
- **UC-02:** Admin tạo báo cáo tuần bằng AI.
- **US-01:** Với vai trò là Quản lý, tôi muốn xem một dashboard tổng quan để nhanh chóng đánh giá tình hình các dự án.

#### 4.2. Sơ đồ Use Case

**UC-01: Admin cập nhật tiến độ công việc**
```ascii
[Admin @ Trang chi tiết dự án]
        |
        +-----> 1. Nhấp vào một công việc trong danh sách
        |
        v
[Hệ thống hiển thị Modal chi tiết công việc]
        |
        +-----> 2. Admin thay đổi trạng thái (ví dụ: sang "Completed")
        |
        +-----> 3. Nhấn nút "Save Changes"
        |
        v
[Hệ thống gửi yêu cầu cập nhật đến Dataverse]
        |
        +-----> 4. Dữ liệu được lưu thành công
        |
        v
[Hệ thống tự động làm mới danh sách công việc trên giao diện]
```

**UC-02: Admin tạo báo cáo tuần bằng AI**
```ascii
[Admin @ Dashboard]
        |
        +-----> 1. Nhấp vào nút "Generate Report"
        |
        v
[Hệ thống hiển thị Modal tạo báo cáo]
        |
        +-----> 2. Admin chọn Người thực hiện và Khoảng thời gian
        |
        +-----> 3. Nhấn nút "Generate Report"
        |
        v
[Hệ thống gửi dữ liệu công việc đã lọc đến Gemini AI]
        |
        +-----> 4. AI xử lý và trả về báo cáo dạng HTML
        |
        v
[Hệ thống hiển thị bản xem trước của báo cáo]
```

---

### 5. Sơ Đồ Quy Trình (Process Flow)

#### 5.1. Quy trình hiện tại (As-Is)
```ascii
[Bắt đầu] -> [Yêu cầu qua email/chat] -> [Nhân viên quản lý trên file Excel] -> [Cuối tuần tổng hợp thủ công] -> [Gửi báo cáo qua email] -> [Quản lý tổng hợp lại] -> [Kết thúc]
```

#### 5.2. Quy trình tương lai (To-Be)
```ascii
[Bắt đầu] -> [Quản lý tạo và giao việc trên App] -> [Nhân viên cập nhật tiến độ trên App] -> [Quản lý vào App] -> [Sử dụng chức năng "Tạo Báo Cáo"] -> [Hệ thống tự động tạo báo cáo] -> [Kết thúc]
```

---

### 6. Sơ Đồ Thực Thể Quan Hệ (ERD)

Sơ đồ thể hiện mối quan hệ giữa các thực thể chính trong hệ thống.

```ascii
+----------------+       (1)       +--------+       (N)       +----------------+
|    PROJECT     |<|----------o|   TASK   |o----------|>|  PRODUCT_MEMBER  |
+----------------+                 +--------+                 +----------------+
| ai_processid (PK) |                 | id (PK)  |                 | id (PK)          |
| ai_name        |                 | name     |                 | name           |
| ...            |                 | status   |                 | ...            |
+----------------+                 +--------+                 +----------------+
```
- Một `PROJECT` có thể có nhiều `TASK`.
- Một `PRODUCT_MEMBER` (người thực hiện) có thể được giao nhiều `TASK`.

---

### 7. Giả Định và Ràng Buộc (Assumptions and Constraints)

#### 7.1. Giả định
- Cấu trúc dữ liệu trong Microsoft Dataverse là ổn định.
- API của Power Automate và Dataverse hoạt động ổn định.
- API của Google Gemini luôn sẵn sàng.

#### 7.2. Ràng buộc
- Ứng dụng chỉ tích hợp với một instance Dataverse duy nhất.
- Chức năng đăng nhập chỉ mang tính giả lập (impersonate) dựa trên danh sách người dùng cố định.
- Ứng dụng là một công cụ nội bộ, không triển khai ra internet công cộng.
```