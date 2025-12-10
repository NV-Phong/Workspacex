"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface Status {
  IDStatus: string;
  Status: string;
  StatusOrder: number;
  IsDeleted: number;
}

// Data cứng cho statuses (dùng chung cho tất cả projects)
const MOCK_STATUSES: Status[] = [
  {
    IDStatus: "status-1",
    Status: "To Do",
    StatusOrder: 1,
    IsDeleted: 0
  },
  {
    IDStatus: "status-2",
    Status: "In Progress",
    StatusOrder: 2,
    IsDeleted: 0
  },
  {
    IDStatus: "status-3",
    Status: "Review",
    StatusOrder: 3,
    IsDeleted: 0
  },
  {
    IDStatus: "status-4",
    Status: "Done",
    StatusOrder: 4,
    IsDeleted: 0
  }
];

export function useGetStatuses() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const projectId = Cookies.get('IDProject');
      
      if (!projectId) {
        throw new Error('Không tìm thấy Project ID');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Sort statuses by StatusOrder before setting state
      const sortedStatuses = [...MOCK_STATUSES].sort((a, b) => a.StatusOrder - b.StatusOrder);
      setStatuses(sortedStatuses);
    } catch (error: any) {
      const errorMessage = error.message || "Không thể lấy danh sách status. Vui lòng thử lại sau.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  return {
    statuses,
    isLoading,
    error,
    reload: fetchStatuses
  };
}