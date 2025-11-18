
# Tài Liệu Thiết Kế Kỹ Thuật
**Dự án:** Trình Theo Dõi Dự Án (Project Tracker)  
**Ngày tạo:** 26/07/2024  
**Phiên bản:** 1.0

---

### 1. Tổng Quan Giải Pháp (Solution Overview)

Giải pháp là một ứng dụng web Single Page Application (SPA) được xây dựng bằng React và TypeScript, cung cấp trải nghiệm người dùng nhanh và mượt mà. Ứng dụng đóng vai trò là giao diện (front-end) để trực quan hóa và tương tác với dữ liệu từ Microsoft Dataverse.

- **Front-end:** React, TypeScript, Tailwind CSS.
- **Back-end/Dữ liệu:** Microsoft Dataverse.
- **Xác thực & API Gateway:** Power Automate Flow đóng vai trò trung gian để cấp Access Token.
- **Tích hợp AI:** Sử dụng Google Gemini API thông qua thư viện `@google/genai`.

---

### 2. Sơ Đồ Kiến Trúc (Architecture Diagram)

```ascii
                                     +--------------------+      +-----------------------+
                                (2)  |   Dataverse OData  | (3)  |                       |
     +-----------------+     API Call  |        API         |----->|      Database         |
     |                 |------------- >| (CRUD Operations)  |<---- | (Projects, Tasks)     |
     |                 |               +--------------------+ (4)  |                       |
     |                 |                                          +-----------------------+
     |   React Client  |
     | (Trình duyệt)    |
     |                 |    (1)    +--------------------+
     |                 |---------->|  Power Automate    |
     |                 |  Get Token  |      (Workflow)      |
     |                 |           +--------------------+
     |                 |
     |                 |    (5)    +--------------------+
     |                 |---------->|  Google Gemini     |
     +-----------------+  Prompt    |        API         |
                                <----------|                    |
                                 (6) HTML  +--------------------+
```
**Luồng hoạt động:**
1.  **Client** gọi Power Automate để lấy `access_token`.
2.  **Client** dùng token để gửi yêu cầu CRUD (Create, Read, Update, Delete) đến Dataverse.
3.  **Dataverse** xử lý yêu cầu.
4.  **Dataverse** trả về dữ liệu.
5.  Khi cần tạo báo cáo, **Client** gửi prompt đến Gemini AI.
6.  **Gemini AI** trả về báo cáo dạng HTML.

---

### 3. Thiết Kế Module / Component (Component Design)

Ứng dụng được cấu trúc theo các component React có thể tái sử dụng:

- **`App.tsx`**: Component gốc, quản lý state toàn cục và điều hướng.
- **`services/dataverseService.ts`**: Module xử lý logic gọi API đến Dataverse.
- **`components/`**: Thư mục chứa các UI component.
  - **`ProjectList.tsx`**: Menu điều hướng bên trái, hiển thị danh sách dự án.
  - **`Dashboard.tsx`**: Màn hình chính, hiển thị thông tin tổng quan.
  - **`ProjectDetail.tsx`**: Hiển thị tất cả thông tin chi tiết của một dự án.
  - **`TaskList.tsx`**: Hiển thị danh sách công việc, hỗ trợ lọc và chỉnh sửa.
  - **`TaskDetailModal.tsx`**: Form modal để chỉnh sửa chi tiết một công việc.
  - **`WeeklyReportModal.tsx`**: Form modal cho chức năng tạo báo cáo AI.
  - **`Card.tsx`, `Tabs.tsx`**: Các component UI chung.

---

### 4. Sơ Đồ Luồng Xử Lý (Process Flow Diagram)

**Luồng cập nhật một công việc:**
```ascii
[User clicks 'Save' in TaskDetailModal]
         |
         v
[onSave(taskId, data) is called]
         |
         v
[updateTask(taskId, data) in dataverseService]
         |
         +-----> [Constructs PATCH request payload]
         |
         v
[dataverseFetch('PATCH', /tasks(taskId), payload)]
         |
         +-----> [Dataverse API processes request]
         |
         v
[API returns Success (204)]
         |
         v
[fetchTasks() is called to refresh UI]
         |
         v
[React state is updated, UI re-renders]
```

---

### 5. Wireframe Giao Diện (UI Wireframe)

#### Bố cục chính
```ascii
+----------------------+------------------------------------------------+
| Sidebar (296px)      | Main Content Area                              |
|                      |                                                |
| - Dashboard Link     | +--------------------------------------------+ |
| - Project List       | |                                            | |
|   - ACTIVE           | |      Dashboard / Project Detail View       | |
|   - MAINTENANCE      | |                                            | |
|                      | +--------------------------------------------+ |
|                      |                                                |
+----------------------+------------------------------------------------+
```

#### Trang chi tiết dự án
```ascii
+------------------------------------------------------------------------+
| Project Name | Edit Btn                                                |
| Description...                                                         |
+------------------------------------------------------------------------+
| +--------------------------+  +--------------------------------------+ |
| | Progress Card            |  | Basic Info Card                      | |
| | - Overall Progress Bar   |  | - Requester: ...                     | |
| | - Current Step: ...      |  | - Priority: ...                      | |
| +--------------------------+  +--------------------------------------+ |
| +--------------------------+  +--------------------------------------+ |
| | Tasks List Card          |  | Technical Details Card               | |
| | - Tabs (All, To Do, ...) |  | - Tabs (Docs, Tech Stack)            | |
| | - [Task Item 1]          |  | - [Link to User Guide]               | |
| | - [Task Item 2]          |  |                                      | |
| +--------------------------+  +--------------------------------------+ |
+------------------------------------------------------------------------+
```

---

### 6. Mô Hình Dữ Liệu (Data Model)

Cấu trúc dữ liệu front-end được định nghĩa trong `types.ts`.

**`Project` interface:**
```typescript
export interface Project {
  ai_processid: string;
  ai_name: string;
  category: 'ACTIVE' | 'MAINTENANCE' | 'PLANNED' | 'COMPLETED';
  crdfd_description?: string;
  crdfd_start_date?: string;
  crdfd_end_date?: string;
  // ...
}
```

**`Task` interface:**
```typescript
export interface Task {
  id: string; // Mapped from crdfd_tech_tasksid
  name: string;
  status: 'To Do' | 'In Progress' | 'Completed' | ...;
  assignee: string;
  assigneeId?: string;
  projectId?: string;
  // ...
}
```

---

### 7. Thiết Kế Tích Hợp (Integration Design)

- **Microsoft Dataverse:**
  - **Phương thức:** Gọi API OData v9.2.
  - **Endpoint:** `https://wecare-ii.crm5.dynamics.com/api/data/v9.2/`
  - **Xác thực:** Sử dụng Bearer Token được cấp phát bởi Power Automate Flow để ẩn thông tin nhạy cảm khỏi client.

- **Google Gemini API:**
  - **Phương thức:** Sử dụng thư viện `@google/genai`.
  - **Xác thực:** Sử dụng API Key được quản lý như một biến môi trường.
  - **Mô hình:** `gemini-2.5-flash` được sử dụng để cân bằng giữa tốc độ và khả năng xử lý.

---

### 8. Bảo Mật và Kiểm Soát Truy Cập (Security & Access Control)

- **Phân quyền phía Client:** Logic hiển thị/ẩn các nút hành động (thêm, sửa) được kiểm soát bởi state `isAuthenticated`.
- **Giới hạn thao tác ghi:** Các yêu cầu `POST` và `PATCH` gửi đến Dataverse có thể được bổ sung header `MSCRMCallerID` với ID của người dùng đã đăng nhập để ghi nhận đúng người thực hiện thay đổi.
- **Bảo vệ API Key:**
  - **Dataverse:** Client không trực tiếp giữ thông tin xác thực. Nó gọi một Power Automate Flow để nhận token tạm thời.
  - **Gemini:** API Key không bị lộ ra trong mã nguồn front-end.
```