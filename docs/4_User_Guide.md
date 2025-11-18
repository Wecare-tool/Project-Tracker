
# Hướng Dẫn Sử Dụng (User Guide)
**Ứng dụng:** Trình Theo Dõi Dự Án (Project Tracker)  
**Ngày cập nhật:** 26/07/2024  
**Phiên bản:** 1.0

---

### 1. Giới Thiệu (Introduction)

Chào mừng bạn đến với ứng dụng **Trình Theo Dõi Dự Án**.

Tài liệu này sẽ hướng dẫn bạn cách sử dụng các tính năng chính của hệ thống để xem và quản lý dự án một cách hiệu quả.

#### 1.1. Vai Trò Người Dùng
- **Người dùng (Viewer):** Bất kỳ ai truy cập vào ứng dụng mà không đăng nhập. Có quyền xem tất cả thông tin dự án và công việc.
- **Quản trị viên (Admin):** Người dùng đã đăng nhập. Có đầy đủ quyền xem, tạo mới và chỉnh sửa dự án/công việc.

---

### 2. Truy Cập Hệ Thống (System Access)

#### 2.1. Truy cập với quyền xem (Viewer)
- Mở trình duyệt web và truy cập vào địa chỉ URL của ứng dụng.
- Mặc định, bạn sẽ ở vai trò người dùng thường và có thể xem mọi thông tin.

#### 2.2. Đăng nhập với quyền Quản trị viên (Admin)
1.  Tại menu bên trái, nhấp vào tiêu đề **"Project Tracker"**.
      <!-- Placeholder for image -->
2.  Một cửa sổ (modal) đăng nhập sẽ xuất hiện.
3.  **Chọn tên của bạn** từ danh sách thả xuống.
4.  **Nhập mật khẩu** được cung cấp.
5.  Nhấn nút **"Login"**.

Sau khi đăng nhập thành công, bạn sẽ thấy các nút chức năng quản trị như "Add Project", "Edit Project", "Add Task" xuất hiện.

---

### 3. Hướng Dẫn Chức Năng (Feature Guide)

#### 3.1. Màn Hình Chính (Dashboard)
- Đây là màn hình đầu tiên bạn thấy khi truy cập.
- **Dashboard** cung cấp một cái nhìn tổng quan về các thông tin quan trọng và danh sách các dự án đang hoạt động ("Active Projects").
- Bạn có thể nhấp vào nút **"View Details"** trên mỗi thẻ dự án để đi đến trang chi tiết.

#### 3.2. Xem Chi Tiết Dự Án
- Từ bất kỳ màn hình nào, bạn có thể nhấp vào tên một dự án ở menu bên trái để xem trang chi tiết của dự án đó.
- Trang này bao gồm:
  - **Thông tin chung:** Tên, mô tả, người liên quan, thời gian.
  - **Tiến độ:** Thanh tiến độ tổng quan, bước hiện tại, bước tiếp theo và các trở ngại.
  - **Danh sách công việc:** Liệt kê tất cả các công việc thuộc dự án. Bạn có thể lọc danh sách này theo trạng thái (ví dụ: To Do, In Progress...).
  - **Tài liệu và Công nghệ:** Các liên kết đến tài liệu và thông tin về công nghệ sử dụng.

#### 3.3. Quản Lý Dự Án (Chỉ dành cho Admin)

- **Thêm dự án mới:**
  1. Đảm bảo bạn đã đăng nhập.
  2. Ở cuối menu bên trái, nhấn nút **"+ Add Project"**.
  3. Điền đầy đủ thông tin vào form và nhấn **"Create Project"**.
  4. Hệ thống sẽ tự động tạo dự án và 5 công việc mặc định.
- **Chỉnh sửa dự án:**
  1. Đi đến trang chi tiết của dự án bạn muốn sửa.
  2. Nhấn nút **"Edit Project"** ở góc trên bên phải.
  3. Thay đổi thông tin trong form và nhấn **"Save Changes"**.

#### 3.4. Quản Lý Công Việc (Chỉ dành cho Admin)

- **Thêm công việc mới:**
  1. Đi đến trang chi tiết dự án.
  2. Trong khu vực "Tasks", nhấn nút **"+ Add Task"**.
  3. Điền thông tin công việc, chọn người thực hiện, và nhấn **"Save Task"**.
- **Chỉnh sửa công việc:**
  1. Trong danh sách công việc của một dự án, nhấp vào công việc bạn muốn sửa.
  2. Một modal chi tiết sẽ hiện ra. Tại đây bạn có thể thay đổi mọi thông tin từ tên, mô tả, trạng thái, người thực hiện, đến ngày tháng.
  3. Nhấn **"Save Changes"** để lưu lại.
- **Mẹo:** Bạn có thể dán (paste) hình ảnh trực tiếp vào ô **Description** hoặc **Proof of Complete** khi đang chỉnh sửa.

#### 3.5. Tạo Báo Cáo Tuần (Chỉ dành cho Admin)
1.  Truy cập màn hình **Dashboard**.
2.  Nhấn vào biểu tượng clipboard (Weekly Report) ở góc trên bên phải.
3.  Trong modal hiện ra:
    - Chọn **Người thực hiện** bạn muốn tạo báo cáo.
    - Chọn **khoảng thời gian** bắt đầu và kết thúc.
    - Nhấn nút **"Tạo Báo Cáo"**.
4.  Hệ thống sẽ dùng AI để phân tích các công việc trong khoảng thời gian đó và tạo ra một báo cáo chuyên nghiệp.
5.  Bạn có thể xem trước, chỉnh sửa nội dung (trong tab "Edit"), và nhấn **"Copy All"** để dán vào email hoặc các công cụ khác.

---

### 4. Mẹo và Xử Lý Sự Cố (Tips & Troubleshooting)

- **Dữ liệu không được cập nhật?**
  - Hãy thử tải lại trang (F5 hoặc Ctrl+R). Do dữ liệu được cache, đôi khi cần làm mới để thấy thay đổi mới nhất.
- **Không thể đăng nhập?**
  - Đảm bảo bạn đã chọn đúng tên và nhập đúng mật khẩu. Mật khẩu có phân biệt chữ hoa, chữ thường.
- **Báo cáo tạo ra không như ý?**
  - Hãy kiểm tra lại khoảng thời gian bạn đã chọn. Đảm bảo rằng trong khoảng thời gian đó, người thực hiện có các công việc đã được cập nhật trạng thái.

---