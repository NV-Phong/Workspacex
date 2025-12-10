"use client";

import { useState, useEffect, useCallback } from "react";

// Định nghĩa kiểu dữ liệu cho workspace
interface Workspace {
  IDWorkspace: string;
  WorkSpaceName: string;
  WorkSpaceDescription: string;
}

// Data cứng cho workspaces
const MOCK_WORKSPACES: Workspace[] = [
  {
    IDWorkspace: "ws-1",
    WorkSpaceName: "Development Workspace",
    WorkSpaceDescription: "Không gian làm việc chính cho team phát triển. Bao gồm các dự án frontend, backend và mobile app. Tập trung vào việc xây dựng các tính năng mới và cải thiện hiệu suất hệ thống."
  },
  {
    IDWorkspace: "ws-2",
    WorkSpaceName: "Design Studio",
    WorkSpaceDescription: "Workspace dành cho team thiết kế UI/UX. Quản lý các dự án thiết kế, tài nguyên đồ họa và quy trình làm việc sáng tạo. Tập trung vào việc tạo ra các trải nghiệm người dùng tuyệt vời."
  },
  {
    IDWorkspace: "ws-3",
    WorkSpaceName: "Marketing Hub",
    WorkSpaceDescription: "Không gian làm việc cho team marketing và truyền thông. Quản lý các chiến dịch, nội dung và phân tích hiệu suất. Đảm bảo thông điệp thương hiệu được truyền tải hiệu quả đến khách hàng."
  }
];

export function useGetWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setWorkspaces(MOCK_WORKSPACES);
    } catch (error: any) {
      const errorMessage = "Không thể lấy danh sách workspace. Vui lòng thử lại sau.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return {
    workspaces,
    isLoading,
    error,
    refreshWorkspaces: fetchWorkspaces
  };
}