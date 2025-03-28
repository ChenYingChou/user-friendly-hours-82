
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeEntries, TimeEntry } from "@/contexts/TimeEntriesContext";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line 
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { zhTW } from "date-fns/locale";

const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#d35400", "#34495e"];

const Analysis = () => {
  const { user } = useAuth();
  const { getUserTimeEntries } = useTimeEntries();
  
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [dateRange, setDateRange] = useState<"current" | "lastWeek" | "lastMonth">("current");
  
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [detailedEntries, setDetailedEntries] = useState<TimeEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const userEntries = getUserTimeEntries(user.id);
      
      // Filter entries based on the selected date range
      const filteredEntries = filterEntriesByDateRange(userEntries, dateRange);
      setEntries(filteredEntries);
      
      // Process data for visualizations
      processCategoryData(filteredEntries);
      processSubCategoryData(filteredEntries);
      processDailyData(filteredEntries);
    }
  }, [user, getUserTimeEntries, dateRange]);

  const filterEntriesByDateRange = (entries: TimeEntry[], range: string): TimeEntry[] => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (range) {
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
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    }
    
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const processCategoryData = (entries: TimeEntry[]) => {
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
  };

  const processSubCategoryData = (entries: TimeEntry[]) => {
    const subCategoryMap = new Map<string, number>();
    
    entries.forEach((entry) => {
      const subCategory = entry.subCategory;
      const hours = entry.hours;
      const currentHours = subCategoryMap.get(subCategory) || 0;
      subCategoryMap.set(subCategory, currentHours + hours);
    });
    
    const subCategoryArray = Array.from(subCategoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 subcategories
    
    setSubCategoryData(subCategoryArray);
  };

  const processDailyData = (entries: TimeEntry[]) => {
    const dailyHours: Record<string, number> = {};
    
    // Get date range
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
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    }
    
    // Initialize all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = format(currentDate, "yyyy-MM-dd");
      dailyHours[dateString] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill with actual data
    entries.forEach((entry) => {
      const dateString = entry.date;
      dailyHours[dateString] = (dailyHours[dateString] || 0) + entry.hours;
    });
    
    const dailyArray = Object.entries(dailyHours).map(([date, hours]) => {
      const displayDate = format(new Date(date), "MM/dd (EEE)", { locale: zhTW });
      return {
        date: displayDate,
        hours,
        fullDate: date,
      };
    });
    
    setDailyData(dailyArray);
  };

  const handleCategoryClick = (data: any) => {
    if (data && data.name) {
      const category = data.name;
      const filtered = entries.filter((entry) => entry.mainCategory === category);
      setDetailedEntries(filtered);
      setSelectedCategory(category);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">工時分析</h1>
            <p className="text-muted-foreground">
              分析工時的分佈情況和趨勢
            </p>
          </div>
          <Tabs value={dateRange} onValueChange={(value) => setDateRange(value as any)} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">本週</TabsTrigger>
              <TabsTrigger value="lastWeek">上週</TabsTrigger>
              <TabsTrigger value="lastMonth">上個月</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>工作類別分佈</CardTitle>
              <CardDescription>
                點擊圓餅圖片段查看詳細資訊
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handleCategoryClick}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
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

          <Card>
            <CardHeader>
              <CardTitle>每日工時趨勢</CardTitle>
              <CardDescription>
                顯示每日工作時間的分佈
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value} 小時`, "工時"]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      name="工時" 
                      stroke="#3498db" 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">沒有足夠的資料顯示</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>次要類別工時</CardTitle>
              <CardDescription>
                顯示次要類別的工時分佈（前10名）
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {subCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subCategoryData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} 小時`, "工時"]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="工時" 
                      fill="#3498db" 
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
        </div>

        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>"{selectedCategory}" 類別詳細記錄</CardTitle>
              <CardDescription>
                共 {detailedEntries.length} 筆記錄，總計 {detailedEntries.reduce((sum, entry) => sum + entry.hours, 0)} 小時
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>時數</TableHead>
                    <TableHead>次要類別</TableHead>
                    <TableHead>描述</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), "yyyy-MM-dd")}</TableCell>
                      <TableCell>{entry.hours}</TableCell>
                      <TableCell>{entry.subCategory}</TableCell>
                      <TableCell className="max-w-md truncate">{entry.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Analysis;
