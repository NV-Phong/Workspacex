"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface Project {
  IDProject: string;
  IDTeam: string;
  ProjectName: string;
  ProjectDescription: string;
  IsDeleted: number;
}

interface Status {
  IDStatus: string;
  IDProject: string;
  Status: string;
  StatusOrder: number;
  IsDeleted: number;
}

interface Task {
  IDTask: string;
  IDStatus: string;
  IDTag: string | null;
  IDAssignee: string | null;
  TaskName: string;
  TaskDescription: string;
  Priority: string;
  CreateAt: string;
  StartDay: string | null;
  EndDay: string | null;
  DueDay: string | null;
  IsDeleted: number;
  project: Project;
  status: Status;
  tag: any | null;
  assignee: any | null;
  attachments: any[];
}

// Helper function to create mock project
const createMockProject = (id: string, name: string): Project => ({
  IDProject: id,
  IDTeam: "team-1",
  ProjectName: name,
  ProjectDescription: "Mock project description",
  IsDeleted: 0
});

// Helper function to create mock status
const createMockStatus = (id: string, status: string, order: number): Status => ({
  IDStatus: id,
  IDProject: "proj-1",
  Status: status,
  StatusOrder: order,
  IsDeleted: 0
});

// Data cứng cho tasks theo project
const MOCK_TASKS: Record<string, Task[]> = {
  "proj-1": [
    {
      IDTask: "task-1",
      IDStatus: "status-1",
      IDTag: null,
      IDAssignee: "user-1",
      TaskName: "Thiết kế giao diện trang chủ",
      TaskDescription: "Tạo mockup và prototype cho trang chủ với các section: hero, features, testimonials và footer. Đảm bảo responsive trên mọi thiết bị.",
      Priority: "High",
      CreateAt: new Date().toISOString(),
      StartDay: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      EndDay: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      DueDay: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      IsDeleted: 0,
      project: createMockProject("proj-1", "E-Commerce Platform"),
      status: createMockStatus("status-1", "To Do", 1),
      tag: null,
      assignee: { IDUser: "user-1", DisplayName: "John Doe" },
      attachments: []
    },
    {
      IDTask: "task-2",
      IDStatus: "status-2",
      IDTag: null,
      IDAssignee: "user-2",
      TaskName: "Implement authentication flow",
      TaskDescription: "Xây dựng luồng đăng nhập, đăng ký và quên mật khẩu. Tích hợp JWT và refresh token mechanism.",
      Priority: "High",
      CreateAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      StartDay: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      EndDay: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      DueDay: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      IsDeleted: 0,
      project: createMockProject("proj-1", "E-Commerce Platform"),
      status: createMockStatus("status-2", "In Progress", 2),
      tag: null,
      assignee: { IDUser: "user-2", DisplayName: "Jane Smith" },
      attachments: []
    },
    {
      IDTask: "task-3",
      IDStatus: "status-3",
      IDTag: null,
      IDAssignee: "user-3",
      TaskName: "Code review cho payment module",
      TaskDescription: "Review code của module thanh toán, kiểm tra security, error handling và performance.",
      Priority: "Medium",
      CreateAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      StartDay: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      EndDay: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      DueDay: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      IsDeleted: 0,
      project: createMockProject("proj-1", "E-Commerce Platform"),
      status: createMockStatus("status-3", "Review", 3),
      tag: null,
      assignee: { IDUser: "user-3", DisplayName: "Bob Wilson" },
      attachments: []
    },
    {
      IDTask: "task-4",
      IDStatus: "status-4",
      IDTag: null,
      IDAssignee: "user-1",
      TaskName: "Setup CI/CD pipeline",
      TaskDescription: "Cấu hình GitHub Actions để tự động build, test và deploy ứng dụng lên staging và production.",
      Priority: "Medium",
      CreateAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      StartDay: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      EndDay: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      DueDay: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      IsDeleted: 0,
      project: createMockProject("proj-1", "E-Commerce Platform"),
      status: createMockStatus("status-4", "Done", 4),
      tag: null,
      assignee: { IDUser: "user-1", DisplayName: "John Doe" },
      attachments: []
    }
  ],
  "proj-2": [
    {
      IDTask: "task-5",
      IDStatus: "status-1",
      IDTag: null,
      IDAssignee: "user-2",
      TaskName: "Thiết kế dashboard layout",
      TaskDescription: "Tạo layout cho admin dashboard với sidebar navigation và main content area.",
      Priority: "High",
      CreateAt: new Date().toISOString(),
      StartDay: null,
      EndDay: null,
      DueDay: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      IsDeleted: 0,
      project: createMockProject("proj-2", "Admin Dashboard"),
      status: createMockStatus("status-1", "To Do", 1),
      tag: null,
      assignee: { IDUser: "user-2", DisplayName: "Jane Smith" },
      attachments: []
    }
  ]
};

export function useGetTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const projectId = Cookies.get("IDProject");

      if (!projectId) {
        throw new Error("Không tìm thấy Project ID");
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (projectId && MOCK_TASKS[projectId]) {
        setTasks(MOCK_TASKS[projectId]);
      } else {
        // Fallback to proj-1 if project not found
        setTasks(MOCK_TASKS["proj-1"] || []);
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        "Không thể lấy danh sách tasks. Vui lòng thử lại sau.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    reload: fetchTasks,
  };
}
