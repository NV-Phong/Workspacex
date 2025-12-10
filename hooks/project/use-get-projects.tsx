"use client";

import { useState, useEffect } from "react";

interface Project {
  IDProject: string;
  IDTeam: string;
  ProjectName: string;
  ProjectDescription: string;
  IsDeleted: number;
}

// Data cứng cho projects theo team
const MOCK_PROJECTS: Record<string, Project[]> = {
  "team-1": [
    {
      IDProject: "proj-1",
      IDTeam: "team-1",
      ProjectName: "E-Commerce Platform",
      ProjectDescription: "Xây dựng nền tảng thương mại điện tử với giao diện hiện đại, responsive và tối ưu trải nghiệm người dùng. Sử dụng Next.js 14, TypeScript và Tailwind CSS.",
      IsDeleted: 0
    },
    {
      IDProject: "proj-2",
      IDTeam: "team-1",
      ProjectName: "Admin Dashboard",
      ProjectDescription: "Dashboard quản trị với các tính năng phân tích, báo cáo và quản lý người dùng. Tích hợp biểu đồ và bảng dữ liệu tương tác.",
      IsDeleted: 0
    },
    {
      IDProject: "proj-3",
      IDTeam: "team-1",
      ProjectName: "Landing Page Builder",
      ProjectDescription: "Công cụ tạo landing page kéo thả với nhiều template và component có sẵn. Hỗ trợ preview real-time và export code.",
      IsDeleted: 0
    }
  ],
  "team-2": [
    {
      IDProject: "proj-4",
      IDTeam: "team-2",
      ProjectName: "REST API Gateway",
      ProjectDescription: "API Gateway tập trung để quản lý và định tuyến các microservices. Hỗ trợ authentication, rate limiting và logging.",
      IsDeleted: 0
    },
    {
      IDProject: "proj-5",
      IDTeam: "team-2",
      ProjectName: "User Authentication Service",
      ProjectDescription: "Dịch vụ xác thực người dùng với JWT, OAuth2 và 2FA. Tích hợp với Redis để quản lý session và token.",
      IsDeleted: 0
    }
  ],
  "team-3": [
    {
      IDProject: "proj-6",
      IDTeam: "team-3",
      ProjectName: "Mobile Shopping App",
      ProjectDescription: "Ứng dụng mua sắm di động với React Native. Hỗ trợ thanh toán, đánh giá sản phẩm và theo dõi đơn hàng.",
      IsDeleted: 0
    },
    {
      IDProject: "proj-7",
      IDTeam: "team-3",
      ProjectName: "Fitness Tracker",
      ProjectDescription: "Ứng dụng theo dõi thể dục với Flutter. Ghi nhận hoạt động, thống kê và đặt mục tiêu cá nhân.",
      IsDeleted: 0
    }
  ]
};

export function useGetProjects(teamId: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      if (teamId && MOCK_PROJECTS[teamId]) {
        setProjects(MOCK_PROJECTS[teamId]);
      } else {
        setProjects([]);
      }
    } catch (error: any) {
      const errorMessage = "Không thể lấy danh sách projects. Vui lòng thử lại sau.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchProjects();
    }
  }, [teamId]);

  return {
    projects,
    isLoading,
    error,
    reload: fetchProjects // Expose reload function
  };
}