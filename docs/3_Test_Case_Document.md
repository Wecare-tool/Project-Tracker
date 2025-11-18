
# Tài Liệu Kịch Bản Kiểm Thử (TCD)
**Dự án:** Trình Theo Dõi Dự Án (Project Tracker)  
**Ngày tạo:** 26/07/2024  
**Phiên bản:** 1.0

---

### 1. Giới Thiệu (Introduction)

#### 1.1. Mục Tiêu Kiểm Thử
Tài liệu này xác định các kịch bản và các trường hợp kiểm thử (test case) để xác minh rằng ứng dụng Project Tracker hoạt động đúng theo các yêu cầu đã được định nghĩa trong Tài liệu Phân tích Yêu cầu (RAD). Mục tiêu là đảm bảo chất lượng, tính ổn định và trải nghiệm người dùng của sản phẩm.

#### 1.2. Phạm Vi Kiểm Thử
- **Trong phạm vi (In-scope):**
  - Kiểm thử chức năng (Functional Testing) của tất cả các tính năng chính.
  - Kiểm thử giao diện người dùng (UI Testing).
  - Kiểm thử tích hợp với API Dataverse.
  - Kiểm thử tích hợp với Gemini AI.
  - Kiểm thử trên trình duyệt Google Chrome phiên bản mới nhất.
- **Ngoài phạm vi (Out-of-scope):**
  - Kiểm thử hiệu năng (Performance Testing).
  - Kiểm thử bảo mật (Security Testing).
  - Kiểm thử trên các trình duyệt hoặc thiết bị khác ngoài Chrome.

---

### 2. Môi Trường Kiểm Thử (Test Environment)

- **URL Ứng Dụng:** Môi trường Staging/Test (URL sẽ được cung cấp).
- **Cơ sở dữ liệu:** Một bản sao (sandbox) của instance Dataverse để tránh ảnh hưởng đến dữ liệu production.
- **Tài khoản:**
  - **Tài khoản Admin:** Cung cấp tài khoản có thể đăng nhập để thực hiện các thao tác ghi dữ liệu.
  - **Tài khoản View-only:** Truy cập không cần đăng nhập.
- **Trình duyệt:** Google Chrome (phiên bản mới nhất).

---

### 3. Kịch Bản Kiểm Thử (Test Scenarios)

| ID Scenario | Tên Scenario | Mô Tả |
| :--- | :--- | :--- |
| TS-01 | Kiểm thử luồng người dùng xem (Viewer) | Xác minh rằng người dùng không đăng nhập có thể xem thông tin dự án và công việc nhưng không thể chỉnh sửa. |
| TS-02 | Kiểm thử luồng quản trị viên (Admin) | Xác minh rằng người dùng đã đăng nhập có thể thực hiện tất cả các thao tác CRUD (Tạo, Đọc, Cập nhật) trên dự án và công việc. |
| TS-03 | Kiểm thử chức năng Dashboard | Xác minh rằng Dashboard hiển thị đúng thông tin tổng quan, các thẻ dự án và thanh tiến độ. |
| TS-04 | Kiểm thử quản lý dự án | Xác minh các chức năng liên quan đến việc thêm, sửa thông tin dự án. |
| TS-05 | Kiểm thử quản lý công việc | Xác minh các chức năng liên quan đến việc thêm, sửa, lọc và cập nhật trạng thái công việc. |
| TS-06 | Kiểm thử chức năng tạo báo cáo AI | Xác minh rằng chức năng tạo báo cáo tuần hoạt động chính xác, từ việc nhập liệu đến hiển thị kết quả từ AI. |

---

### 4. Chi Tiết Các Trường Hợp Kiểm Thử (Test Cases)

| TC ID | Mô Tả | Tiền Điều Kiện | Các Bước Thực Hiện | Dữ Liệu Đầu Vào | Kết Quả Mong Đợi | Kết Quả Thực Tế | Trạng Thái | Ghi Chú |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TS-01: Luồng người dùng xem** |
| TC-1.1 | Xem danh sách dự án | Người dùng truy cập vào URL ứng dụng. | 1. Mở ứng dụng. <br> 2. Quan sát menu bên trái. | - | Danh sách các dự án được tải và hiển thị, phân nhóm theo "ACTIVE", "MAINTENANCE", "PLANNED". | | Pass/Fail | |
| TC-1.2 | Xem chi tiết dự án | Người dùng đang ở màn hình chính. | 1. Nhấp vào một dự án trong danh sách. | Tên một dự án bất kỳ. | Nội dung bên phải chuyển sang trang chi tiết dự án, hiển thị đúng thông tin và danh sách công việc của dự án đó. | | Pass/Fail | |
| TC-1.3 | Không thấy nút chỉnh sửa | Người dùng đang ở trang chi tiết dự án. | 1. Quan sát giao diện. | - | Không có các nút "Add Project", "Edit Project", "Add Task". Không thể chỉnh sửa công việc. | | Pass/Fail | |
| **TS-02: Luồng quản trị viên** |
| TC-2.1 | Đăng nhập thành công | Mở modal đăng nhập. | 1. Chọn user từ dropdown. <br> 2. Nhập đúng mật khẩu. <br> 3. Nhấn nút "Login". | User: Hieu Le Hoang <br> Pass: `Hello113@` | Đăng nhập thành công, modal đóng lại, giao diện hiển thị các nút quản trị. | | Pass/Fail | |
| TC-2.2 | Đăng nhập thất bại | Mở modal đăng nhập. | 1. Chọn user. <br> 2. Nhập sai mật khẩu. <br> 3. Nhấn nút "Login". | User: Hieu Le Hoang <br> Pass: `wrongpassword` | Hiển thị thông báo lỗi "Invalid password." và không đăng nhập. | | Pass/Fail | |
| TC-2.3 | Đăng xuất | Admin đã đăng nhập. | 1. Nhấp vào logo "Project Tracker" ở menu trái. | - | Đăng xuất thành công, các nút quản trị biến mất. | | Pass/Fail | |
| **TS-05: Quản lý công việc** |
| TC-5.1 | Thêm công việc mới | Admin đã đăng nhập, đang ở trang chi tiết dự án. | 1. Nhấn nút "Add Task". <br> 2. Điền đầy đủ thông tin vào form. <br> 3. Nhấn "Save Task". | Tên: "Test New Task" <br> Người thực hiện: Hoàng Trần | Công việc mới được tạo thành công và xuất hiện trong danh sách. | | Pass/Fail | |
| TC-5.2 | Chỉnh sửa công việc | Admin đã đăng nhập, đang ở trang chi tiết dự án. | 1. Nhấp vào một công việc. <br> 2. Thay đổi trạng thái sang "Completed". <br> 3. Nhấn "Save Changes". | Trạng thái: Completed | Công việc được cập nhật. Trong danh sách, công việc đó có gạch ngang tên. | | Pass/Fail | |
| TC-5.3 | Lọc công việc | Đang ở trang chi tiết dự án có nhiều công việc với các trạng thái khác nhau. | 1. Nhấn vào tab "In Progress". | - | Danh sách chỉ hiển thị các công việc có trạng thái "In Progress". | | Pass/Fail | |
| **TS-06: Tạo báo cáo AI** |
| TC-6.1 | Tạo báo cáo thành công | Admin đã đăng nhập, ở trang Dashboard. | 1. Mở modal tạo báo cáo. <br> 2. Chọn Người thực hiện. <br> 3. Chọn khoảng thời gian có dữ liệu công việc. <br> 4. Nhấn "Tạo Báo Cáo". | - | Sau một lúc loading, báo cáo được tạo và hiển thị ở khung Preview. Nội dung và định dạng đúng như yêu cầu. | | Pass/Fail | |
| TC-6.2 | Tạo báo cáo không có dữ liệu | Admin đã đăng nhập. | 1. Mở modal. <br> 2. Chọn Người thực hiện và khoảng thời gian không có công việc nào. <br> 3. Nhấn "Tạo Báo Cáo". | - | Hiển thị thông báo "Không tìm thấy công việc nào...". | | Pass/Fail | |

---

### 5. Theo Dõi Lỗi (Defect Tracking)

| Lỗi ID | Mô Tả Lỗi | Mức Độ Ưu Tiên (High/Medium/Low) | Trạng Thái (Open, In Progress, Fixed, Closed) | Người Báo Cáo | Ghi Chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-001 | | | | | |
| BUG-002 | | | | | |
