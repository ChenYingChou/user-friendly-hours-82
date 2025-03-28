
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeEntries, MAIN_CATEGORIES, SUB_CATEGORIES } from "@/contexts/TimeEntriesContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const TimeEntry = () => {
  const { user } = useAuth();
  const { addTimeEntry } = useTimeEntries();
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState("8");
  const [description, setDescription] = useState("");
  const [mainCategory, setMainCategory] = useState(MAIN_CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>([]);

  useEffect(() => {
    if (mainCategory) {
      setSubCategories(SUB_CATEGORIES[mainCategory] || []);
      setSubCategory(SUB_CATEGORIES[mainCategory]?.[0] || "");
    }
  }, [mainCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      await addTimeEntry({
        userId: user.id,
        date,
        hours: parseFloat(hours),
        description,
        mainCategory,
        subCategory,
      });

      // Reset form after successful submission
      setDate(format(new Date(), "yyyy-MM-dd"));
      setHours("8");
      setDescription("");
      setMainCategory(MAIN_CATEGORIES[0]);
      setSubCategory(SUB_CATEGORIES[MAIN_CATEGORIES[0]][0]);
    } catch (error) {
      console.error("Error adding time entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新增工時條目</h1>
          <p className="text-muted-foreground">
            請填寫您的工作時間和相關詳細信息
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>工時詳細資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">日期</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">工時（小時）</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main-category">主要類別</Label>
                  <Select
                    value={mainCategory}
                    onValueChange={setMainCategory}
                    required
                  >
                    <SelectTrigger id="main-category">
                      <SelectValue placeholder="選擇主要類別" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-category">次要類別</Label>
                  <Select
                    value={subCategory}
                    onValueChange={setSubCategory}
                    required
                    disabled={!subCategories.length}
                  >
                    <SelectTrigger id="sub-category">
                      <SelectValue placeholder="選擇次要類別" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="請輸入工作描述..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    保存中...
                  </span>
                ) : (
                  "保存工時條目"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default TimeEntry;
