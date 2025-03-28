
import { useState, useEffect } from "react";
import { TimeEntry, useTimeEntries, MAIN_CATEGORIES, SUB_CATEGORIES } from "@/contexts/TimeEntriesContext";
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

interface EditTimeEntryFormProps {
  entry: TimeEntry;
  onSuccess: (updatedEntry: TimeEntry) => void;
  onCancel: () => void;
}

export const EditTimeEntryForm: React.FC<EditTimeEntryFormProps> = ({
  entry,
  onSuccess,
  onCancel,
}) => {
  const { updateTimeEntry } = useTimeEntries();
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(entry.date);
  const [hours, setHours] = useState(String(entry.hours));
  const [description, setDescription] = useState(entry.description);
  const [mainCategory, setMainCategory] = useState(entry.mainCategory);
  const [subCategory, setSubCategory] = useState(entry.subCategory);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  useEffect(() => {
    if (mainCategory) {
      setSubCategories(SUB_CATEGORIES[mainCategory] || []);
      // Only reset subCategory if the current one is not in the new list
      if (
        SUB_CATEGORIES[mainCategory] &&
        !SUB_CATEGORIES[mainCategory].includes(subCategory)
      ) {
        setSubCategory(SUB_CATEGORIES[mainCategory][0]);
      }
    }
  }, [mainCategory, subCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const updatedEntry: TimeEntry = {
        ...entry,
        date,
        hours: parseFloat(hours),
        description,
        mainCategory,
        subCategory,
      };

      await updateTimeEntry(updatedEntry);
      onSuccess(updatedEntry);
    } catch (error) {
      console.error("Error updating time entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-date">日期</Label>
          <Input
            id="edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-hours">工時（小時）</Label>
          <Input
            id="edit-hours"
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
          <Label htmlFor="edit-main-category">主要類別</Label>
          <Select value={mainCategory} onValueChange={setMainCategory} required>
            <SelectTrigger id="edit-main-category">
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
          <Label htmlFor="edit-sub-category">次要類別</Label>
          <Select
            value={subCategory}
            onValueChange={setSubCategory}
            required
            disabled={!subCategories.length}
          >
            <SelectTrigger id="edit-sub-category">
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
        <Label htmlFor="edit-description">描述</Label>
        <Textarea
          id="edit-description"
          placeholder="請輸入工作描述..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : "保存變更"}
        </Button>
      </div>
    </form>
  );
};
