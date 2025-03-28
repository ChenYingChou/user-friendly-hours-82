
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeEntries, TimeEntry } from "@/contexts/TimeEntriesContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PencilIcon, Trash2Icon, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { EditTimeEntryForm } from "@/components/EditTimeEntryForm";

const UserEntries = () => {
  const { user } = useAuth();
  const { getUserTimeEntries, deleteTimeEntry } = useTimeEntries();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const userEntries = getUserTimeEntries(user.id);
      setEntries(
        [...userEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    }
  }, [user, getUserTimeEntries]);

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;
    
    try {
      setLoading(true);
      await deleteTimeEntry(selectedEntry.id);
      setEntries(entries.filter((entry) => entry.id !== selectedEntry.id));
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const onEntryUpdated = (updatedEntry: TimeEntry) => {
    setEntries(
      entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">我的工時記錄</h1>
          <Link to="/time-entry">
            <Button>新增工時條目</Button>
          </Link>
        </div>

        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>時數</TableHead>
                <TableHead className="hidden md:table-cell">主要類別</TableHead>
                <TableHead className="hidden md:table-cell">次要類別</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    還沒有工時記錄
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.date), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {entry.mainCategory}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {entry.subCategory}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">開啟選單</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(entry)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(entry)}>
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      {selectedEntry && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>編輯工時條目</DialogTitle>
            </DialogHeader>
            <EditTimeEntryForm
              entry={selectedEntry}
              onSuccess={onEntryUpdated}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <p>
            您確定要刪除此工時條目嗎？這個操作無法撤銷。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "刪除中..." : "刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UserEntries;
