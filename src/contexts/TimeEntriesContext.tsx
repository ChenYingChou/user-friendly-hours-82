
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/contexts/AuthContext";

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
  mainCategory: string;
  subCategory: string;
  createdAt: string;
}

// Define all available categories
export const MAIN_CATEGORIES = [
  "Development",
  "Design",
  "Meeting",
  "Planning",
  "Documentation",
  "Learning",
  "Support",
  "Leave",
  "Other",
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  Development: [
    "Frontend",
    "Backend",
    "Database",
    "Testing",
    "DevOps",
    "Bug Fixing",
    "Code Review",
    "Other",
  ],
  Design: [
    "UI Design",
    "UX Design",
    "Graphic Design",
    "Prototyping",
    "Wireframing",
    "User Research",
    "Other",
  ],
  Meeting: [
    "Team Meeting",
    "Client Meeting",
    "Sprint Planning",
    "Sprint Review",
    "Sprint Retrospective",
    "One-on-One",
    "Other",
  ],
  Planning: [
    "Project Planning",
    "Sprint Planning",
    "Roadmap Planning",
    "Resource Planning",
    "Other",
  ],
  Documentation: [
    "Code Documentation",
    "User Documentation",
    "API Documentation",
    "Process Documentation",
    "Other",
  ],
  Learning: [
    "Training",
    "Self-Study",
    "Workshop",
    "Conference",
    "Online Course",
    "Reading",
    "Other",
  ],
  Support: [
    "Customer Support",
    "Technical Support",
    "Internal Support",
    "Other",
  ],
  Leave: [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Public Holiday",
    "Maternity/Paternity Leave",
    "Bereavement Leave",
    "Other",
  ],
  Other: ["Administrative", "Miscellaneous"],
};

interface TimeEntriesContextProps {
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: Omit<TimeEntry, "id" | "createdAt">) => Promise<void>;
  updateTimeEntry: (entry: TimeEntry) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  getUserTimeEntries: (userId: string) => TimeEntry[];
  getTimeEntriesByDateRange: (
    startDate: string,
    endDate: string,
    userId?: string
  ) => TimeEntry[];
  loading: boolean;
}

const TimeEntriesContext = createContext<TimeEntriesContextProps | undefined>(
  undefined
);

// Mock initial time entries for demo
const generateMockTimeEntries = (): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  const users = ["1", "2", "3"];
  const today = new Date();
  
  // Generate entries for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    
    // Generate 2-4 entries per day for each user
    users.forEach((userId) => {
      const entriesPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < entriesPerDay; j++) {
        const mainCategory =
          MAIN_CATEGORIES[Math.floor(Math.random() * MAIN_CATEGORIES.length)];
        const subCategories = SUB_CATEGORIES[mainCategory];
        const subCategory =
          subCategories[Math.floor(Math.random() * subCategories.length)];
        
        entries.push({
          id: uuidv4(),
          userId,
          date: dateString,
          hours: Math.floor(Math.random() * 4) + 1,
          description: `Mock entry ${j + 1} for ${dateString}`,
          mainCategory,
          subCategory,
          createdAt: new Date().toISOString(),
        });
      }
    });
  }
  
  return entries;
};

export const TimeEntriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load time entries from localStorage or initialize with mock data
  useEffect(() => {
    const storedEntries = localStorage.getItem("timeTrackingEntries");
    if (storedEntries) {
      setTimeEntries(JSON.parse(storedEntries));
    } else {
      const mockEntries = generateMockTimeEntries();
      setTimeEntries(mockEntries);
      localStorage.setItem("timeTrackingEntries", JSON.stringify(mockEntries));
    }
    setLoading(false);
  }, []);

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("timeTrackingEntries", JSON.stringify(timeEntries));
    }
  }, [timeEntries, loading]);

  const addTimeEntry = async (
    entry: Omit<TimeEntry, "id" | "createdAt">
  ): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newEntry: TimeEntry = {
        ...entry,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      
      setTimeEntries((prev) => [...prev, newEntry]);
      
      toast({
        title: "Time entry added",
        description: "Your time entry has been successfully recorded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add time entry.",
      });
      throw error;
    }
  };

  const updateTimeEntry = async (updatedEntry: TimeEntry): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setTimeEntries((prev) =>
        prev.map((entry) =>
          entry.id === updatedEntry.id
            ? { ...updatedEntry, createdAt: entry.createdAt }
            : entry
        )
      );
      
      toast({
        title: "Time entry updated",
        description: "Your time entry has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update time entry.",
      });
      throw error;
    }
  };

  const deleteTimeEntry = async (id: string): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
      
      toast({
        title: "Time entry deleted",
        description: "Your time entry has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete time entry.",
      });
      throw error;
    }
  };

  const getUserTimeEntries = (userId: string): TimeEntry[] => {
    return timeEntries.filter((entry) => entry.userId === userId);
  };

  const getTimeEntriesByDateRange = (
    startDate: string,
    endDate: string,
    userId?: string
  ): TimeEntry[] => {
    return timeEntries.filter((entry) => {
      const isInDateRange = entry.date >= startDate && entry.date <= endDate;
      return userId ? isInDateRange && entry.userId === userId : isInDateRange;
    });
  };

  return (
    <TimeEntriesContext.Provider
      value={{
        timeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getUserTimeEntries,
        getTimeEntriesByDateRange,
        loading,
      }}
    >
      {children}
    </TimeEntriesContext.Provider>
  );
};

export const useTimeEntries = () => {
  const context = useContext(TimeEntriesContext);
  if (context === undefined) {
    throw new Error("useTimeEntries must be used within a TimeEntriesProvider");
  }
  return context;
};
