
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeEntries } from "@/contexts/TimeEntriesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Clock, CalendarDays, PlusCircle, BarChart as BarChartIcon } from "lucide-react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserTimeEntries } = useTimeEntries();
  const [userEntries, setUserEntries] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const entries = getUserTimeEntries(user.id);
      setUserEntries(entries);

      // Process data for category pie chart
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
      setCategoryData(categoryArray);

      // Process data for weekly bar chart
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);

      const weeklyHours: Record<string, number> = {};
      
      // Initialize with zeros for each day
      for (let i = 0; i <= 6; i++) {
        const date = new Date(weekAgo);
        date.setDate(weekAgo.getDate() + i);
        const dateString = date.toISOString().split("T")[0];
        weeklyHours[dateString] = 0;
      }

      // Fill with actual data
      entries.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate >= weekAgo && entryDate <= today) {
          const dateString = entry.date;
          weeklyHours[dateString] = (weeklyHours[dateString] || 0) + entry.hours;
        }
      });

      const weeklyArray = Object.entries(weeklyHours).map(
        ([date, hours]) => {
          const displayDate = new Date(date).toLocaleDateString("zh-TW", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          return {
            date: displayDate,
            hours,
          };
        }
      );
      
      setWeeklyData(weeklyArray);
    }
  }, [user, getUserTimeEntries]);

  const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#d35400", "#34495e"];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
          <Link to="/time-entry">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新增工時
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">總工時</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userEntries.reduce((acc, entry) => acc + entry.hours, 0)} 小時
              </div>
              <p className="text-xs text-muted-foreground">
                所有登記的工作時間總計
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">本週工時</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyData.reduce((acc, day) => acc + day.hours, 0)} 小時
              </div>
              <p className="text-xs text-muted-foreground">
                過去 7 天內的工作時間
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">條目數</CardTitle>
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userEntries.length}</div>
              <p className="text-xs text-muted-foreground">
                已記錄的工時條目總數
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>工作類別分佈</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} 小時`, "工時"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">沒有足夠的資料顯示</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>每日工時</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} 小時`, "工時"]}
                    />
                    <Legend />
                    <Bar dataKey="hours" name="工時" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">沒有足夠的資料顯示</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
