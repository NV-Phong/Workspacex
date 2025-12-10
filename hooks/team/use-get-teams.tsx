"use client";

import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho team
interface Leader {
  IDUser: string;
  Username: string;
  Email: string;
  DisplayName: string;
  Avatar: string | null;
  Cover: string | null;
  IsDeleted: number;
}

interface Team {
  IDTeam: string;
  TeamName: string;
  TeamSize: number;
  TeamDescription: string;
  IsDeleted: number;
  leader: Leader;
}

// Data cứng cho teams
const MOCK_TEAMS: Team[] = [
  {
    IDTeam: "team-1",
    TeamName: "Frontend Team",
    TeamSize: 5,
    TeamDescription: "Team phát triển giao diện người dùng với React, Next.js và TypeScript",
    IsDeleted: 0,
    leader: {
      IDUser: "user-1",
      Username: "john_doe",
      Email: "john.doe@example.com",
      DisplayName: "John Doe",
      Avatar: null,
      Cover: null,
      IsDeleted: 0
    }
  },
  {
    IDTeam: "team-2",
    TeamName: "Backend Team",
    TeamSize: 4,
    TeamDescription: "Team phát triển API và hệ thống backend với Node.js và Go",
    IsDeleted: 0,
    leader: {
      IDUser: "user-2",
      Username: "jane_smith",
      Email: "jane.smith@example.com",
      DisplayName: "Jane Smith",
      Avatar: null,
      Cover: null,
      IsDeleted: 0
    }
  },
  {
    IDTeam: "team-3",
    TeamName: "Mobile Team",
    TeamSize: 3,
    TeamDescription: "Team phát triển ứng dụng mobile với React Native và Flutter",
    IsDeleted: 0,
    leader: {
      IDUser: "user-3",
      Username: "bob_wilson",
      Email: "bob.wilson@example.com",
      DisplayName: "Bob Wilson",
      Avatar: null,
      Cover: null,
      IsDeleted: 0
    }
  }
];

export const fetchTeams = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TEAMS;
};

export function useGetTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTeams = async () => {
    setIsLoading(true);
    setError(null);
    const data = await fetchTeams();
    setTeams(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getTeams();
  }, []);

  return {
    teams,
    isLoading,
    error,
    refetch: getTeams
  };
}