
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeEntries, TimeEntry } from "@/contexts/TimeEntriesContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subWeeks, subMonths, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, UsersIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#d35400"];

const Admin = () => {
  const { user } = useAuth();
  const { timeEntries } = useTimeEntries();
  
  const [dateRange, setDateRange] = useState<"current" | "lastWeek" | "lastMonth" | "custom">("current");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userEntries, setUserEntries] = useState<TimeEntry[]>([]);

  // User details mapping
  const userDetails: Record<string, { name: string; email: string }> = {
    "1": { name: "Admin User", email: "admin@example.com" },
    "2": { name: "Regular User", email: "user@example.com" },
    "3": { name: "John Doe", email: "john@example.com" },
  };

  useEffect(() => {
    filterEntries();
  }, [timeEntries, dateRange, customStartDate, customEndDate]);

  const filterEntries = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (dateRange) {
      case "current":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "lastWeek":
        startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        break;
      case "lastMonth":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = customStartDate;
          endDate = customEndDate;
        } else {
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
        }
        break;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    }
    
    // Convert to string format for comparison with entry.date
    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");
    
    const filtered = timeEntries.filter((entry) => {
      return entry.date >= startDateStr && entry.date <= endDateStr;
    });
    
    setFilteredEntries(filtered);
    processUserStats(filtered);
    processCategoryStats(filtered);
  };

  const processUserStats = (entries: TimeEntry[]) => {
    const userMap = new Map<string, number>();
    
    entries.forEach((entry) => {
      const userId = entry.userId;
      const hours = entry.hours;
      const currentHours = userMap.get(userId) || 0;
      userMap.set(userId, currentHours + hours);
    });
    
    const userArray = Array.from(userMap.entries()).map(([userId, hours]) => ({
      userId,
      name: userDetails[userId]?.name || `User ${userId}`,
      hours,
    }));
    
    setUserStats(userArray);
  };

  const processCategoryStats = (entries: TimeEntry[]) => {
    const categoryMap = new Map<string, number>();
    
    entries.forEach((entry) => {
      const category = entry.mainCategory;
      const hours = entry.hours;
      const currentHours = categoryMap.get(category) || 0;
      categoryMap.set(category, currentHours + hours);
    });
    
    const categoryArray = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    
    setCategoryStats(categoryArray);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    const userEntries = filteredEntries.filter((entry) => entry.userId === userId);
    setUserEntries(userEntries);
  };

  const formatDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (dateRange) {
      case "current":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "lastWeek":
        startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        break;
      case "lastMonth":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = customStartDate;
          endDate = customEndDate;
        } else {
          return "自訂日期範圍";
        }
        break;
      default:
        return "";
    }
    
    return `${format(startDate, "yyyy-MM-dd")} 至 ${format(endDate, "yyyy-MM-dd")}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">管理員儀表板</h1>
            <p className="text-muted-foreground">
              查看所有用戶的工時記錄和分析
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs value={dateRange} onValueChange={(value) => setDateRange(value as any)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="current">本週</TabsTrigger>
                <TabsTrigger value="lastWeek">上週</TabsTrigger>
                <TabsTrigger value="lastMonth">上月</TabsTrigger>
                <TabsTrigger value="custom">自訂</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {dateRange === "custom" && (
              <div className="flex gap-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, "yyyy-MM-dd") : "選擇開始日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, "yyyy-MM-dd") : "選擇結束日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          目前顯示: {formatDateRange()}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>使用者工時統計</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {userStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} 小時`, "工時"]} />
                    <Legend />
                    <Bar 
                      dataKey="hours" 
                      name="工時" 
                      fill="#3498db" 
                      onClick={(data) => handleUserClick(data.userId)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">沒有足夠的資料顯示</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>類別工時分佈</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} 小時`, "工時"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">沒有足夠的資料顯示</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>所有使用者工時記錄</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <UsersIcon className="mr-1 h-4 w-4" />
              {filteredEntries.length} 條記錄
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>使用者</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>時數</TableHead>
                    <TableHead>主要類別</TableHead>
                    <TableHead className="hidden md:table-cell">次要類別</TableHead>
                    <TableHead className="hidden md:table-cell">描述</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        所選日期範圍內沒有工時記錄
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{userDetails[entry.userId]?.name || `User ${entry.userId}`}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.hours}</TableCell>
                        <TableCell>{entry.mainCategory}</TableCell>
                        <TableCell className="hidden md:table-cell">{entry.subCategory}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {entry.description}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedUserId && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userDetails[selectedUserId]?.name || `User ${selectedUserId}`} 的工時記錄
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>時數</TableHead>
                      <TableHead>主要類別</TableHead>
                      <TableHead>次要類別</TableHead>
                      <TableHead>描述</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          沒有工時記錄
                        </TableCell>
                      </TableRow>
                    ) : (
                      userEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.hours}</TableCell>
                          <TableCell>{entry.mainCategory}</TableCell>
                          <TableCell>{entry.subCategory}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.description}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
