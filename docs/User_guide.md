
# Hướng Dẫn Sử Dụng (User Guide)
**Ứng dụng:** Trình Theo Dõi Dự Án (Project Tracker)  
**Ngày cập nhật:** 26/07/2024  
**Phiên bản:** 2.0

---

### 1. Introduction (Giới Thiệu)

Chào mừng bạn đến với ứng dụng **Trình Theo Dõi Dự Án**. Tài liệu này sẽ hướng dẫn bạn cách sử dụng các tính năng chính của hệ thống để xem và quản lý dự án một cách hiệu quả.

#### 1.1. Vai Trò Người Dùng
- **Người dùng (Viewer):** Bất kỳ ai truy cập vào ứng dụng mà không đăng nhập. Có quyền xem tất cả thông tin dự án và công việc.
- **Quản trị viên (Admin):** Người dùng đã đăng nhập. Có đầy đủ quyền xem, tạo mới và chỉnh sửa dự án/công việc, cũng như sử dụng các tính năng AI.

---

### 2. System Access (Truy Cập Hệ Thống)

#### 2.1. Truy cập với quyền xem (Viewer)
- Mở trình duyệt web và truy cập vào địa chỉ URL của ứng dụng.
- Mặc định, bạn sẽ ở vai trò người dùng thường và có thể xem mọi thông tin.

#### 2.2. Đăng nhập với quyền Quản trị viên (Admin)
1.  Tại menu bên trái, nhấp vào tiêu đề **"Project Tracker"**.
2.  Một cửa sổ (modal) đăng nhập sẽ xuất hiện.
3.  **Chọn tên của bạn** từ danh sách thả xuống.
4.  **Nhập mật khẩu** được cung cấp: `Hello113@`
5.  Nhấn nút **"Login"**.

Sau khi đăng nhập thành công, bạn sẽ thấy các nút chức năng quản trị như "Add Project", "Edit Project", "Add Task" xuất hiện.

---

### 3. Feature Guide (Hướng Dẫn Chức Năng)

#### 3.1. Màn Hình Chính (Dashboard)
- Đây là màn hình đầu tiên bạn thấy, cung cấp cái nhìn tổng quan về các dự án đang hoạt động.
- Bạn có thể nhấp vào nút **"View Details"** trên mỗi thẻ dự án để đi đến trang chi tiết.
```ascii
[Dashboard]
  |
  +-- [Summary Card 1: Weekly Sync-Up]
  |
  +-- [Summary Card 2: Blockers / Pending Tasks]
  |
  +-- [Active Projects]
        |
        +-- [Project Card A] --> Click "View Details"
        |
        +-- [Project Card B] --> Click "View Details"
```

#### 3.2. Xem Chi Tiết Dự Án
- Nhấp vào tên một dự án ở menu bên trái để xem trang chi tiết của dự án đó.
- Trang này bao gồm:
  - **Thông tin chung:** Tên, mô tả, người liên quan, thời gian.
  - **Tiến độ:** Thanh tiến độ tổng quan và các bước công việc.
  - **Danh sách công việc:** Liệt kê tất cả các công việc thuộc dự án.

#### 3.3. Quản Lý Dự Án (Chỉ dành cho Admin)

- **Thêm dự án mới:**
  1.  Đăng nhập với quyền Admin.
  2.  Ở cuối menu bên trái, nhấn nút **"+ Add Project"**.
  3.  Điền thông tin vào form và nhấn **"Create Project"**.
- **Chỉnh sửa dự án:**
  1.  Đi đến trang chi tiết của dự án bạn muốn sửa.
  2.  Nhấn nút **"Edit Project"** ở góc trên bên phải.
  3.  Thay đổi thông tin trong form và nhấn **"Save Changes"**.

#### 3.4. Quản Lý Công Việc (Chỉ dành cho Admin)

- **Thêm công việc mới:**
  1.  Đi đến trang chi tiết dự án.
  2.  Trong khu vực "Tasks", nhấn nút **"+ Add Task"**.
  3.  Điền thông tin và nhấn **"Save Task"**.
- **Chỉnh sửa công việc:**
  1.  Trong danh sách công việc, nhấp vào công việc bạn muốn sửa.
  2.  Một modal chi tiết sẽ hiện ra. Bạn có thể thay đổi mọi thông tin.
  3.  Nhấn **"Save Changes"** để lưu lại.
- **Mẹo:** Bạn có thể dán (paste) hình ảnh trực tiếp vào ô **Description** hoặc **Proof of Complete**.

#### 3.5. Tạo Báo Cáo Tuần bằng AI (Chỉ dành cho Admin)
1.  Truy cập màn hình **Dashboard**.
2.  Nhấn vào biểu tượng clipboard (Weekly Report) ở góc trên bên phải.
    ```ascii
    [Dashboard] -> [Góc trên bên phải] -> [Nhấn nút Báo cáo]
    ```
3.  Trong modal hiện ra:
    - Chọn **Người thực hiện**.
    - Chọn **khoảng thời gian** báo cáo.
    - Nhấn nút **"Generate Report"**.
4.  Hệ thống sẽ dùng AI để tạo ra một báo cáo chuyên nghiệp.
5.  Bạn có thể xem trước, chỉnh sửa (trong tab "Edit"), và nhấn **"Copy All"** để dán vào email.

#### 3.6. Tạo Tài Liệu Dự Án bằng AI (Chỉ dành cho Admin)
1.  Truy cập trang **chi tiết của một dự án**.
2.  Nhấn vào nút **"Generate Docs"** màu tím ở góc trên bên phải.
3.  Trong modal hiện ra:
    - Chọn loại tài liệu bạn muốn tạo ở menu bên trái (Requirement, Technical, User Guide).
    - Nhấn nút **"Generate"**.
4.  Hệ thống sẽ dùng AI để phân tích toàn bộ thông tin dự án và các công việc liên quan để tạo ra một tài liệu hoàn chỉnh.
5.  Bạn có thể xem trước và nhấn **"Copy HTML"** để dán vào các công cụ khác.

---

### 4. Tips và Troubleshooting (Mẹo và Xử Lý Sự Cố)

- **Dữ liệu không được cập nhật?**
  - Hãy thử tải lại trang (F5 hoặc Ctrl+R). Do dữ liệu được cache, đôi khi cần làm mới để thấy thay đổi mới nhất.
- **Không thể đăng nhập?**
  - Đảm bảo bạn đã chọn đúng tên và nhập đúng mật khẩu. Mật khẩu có phân biệt chữ hoa, chữ thường.
- **Báo cáo AI tạo ra không như ý?**
  - Hãy kiểm tra lại khoảng thời gian bạn đã chọn (đối với Báo cáo tuần) và đảm bảo rằng các công việc trong dự án có đầy đủ thông tin mô tả (đối với Tài liệu dự án).

---

### 5. FAQ và Support (Câu Hỏi Thường Gặp và Hỗ Trợ)

- **Câu hỏi: Mật khẩu đăng nhập là gì?**
  - Trả lời: Mật khẩu mặc định cho tất cả các tài khoản admin là `Hello113@`.
- **Câu hỏi: Tôi có thể thêm người dùng mới không?**
  - Trả lời: Hiện tại, danh sách người dùng được định nghĩa sẵn trong hệ thống và không thể thay đổi qua giao diện.
- **Hỗ trợ:**
  - Nếu có vấn đề, vui lòng liên hệ bộ phận IT để được trợ giúp.
