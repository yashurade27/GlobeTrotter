"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Search, 
  UserX, 
  UserCheck, 
  Trash2, 
  Shield,
  ShieldCheck,
  Calendar,
  Mail,
  User
} from "lucide-react";
import { getUsers, toggleUserBan, deleteUser } from "@/lib/actions/admin";
import useSession from "@/hooks/useSession";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Define the User type based on our schema
type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  isBanned: boolean;
  createdAt: Date;
  _count: {
    trips: number;
  };
};

const UserDataTable = () => {
  const router = useRouter();
  const { sessionId } = useSession();
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 -ml-2"
        >
          <User className="mr-1 h-4 w-4" />
          Name
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {(row.getValue("name") as string)?.charAt(0)?.toUpperCase() || 
             (row.getValue("email") as string)?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="font-medium">{row.getValue("name") || "No name"}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 -ml-2"
        >
          <Mail className="mr-1 h-4 w-4" />
          Email
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
            {role === "ADMIN" ? (
              <ShieldCheck className="mr-1 h-3 w-3" />
            ) : (
              <Shield className="mr-1 h-3 w-3" />
            )}
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "_count.trips",
      header: "Trips",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original._count.trips}
        </div>
      ),
    },
    {
      accessorKey: "isBanned",
      header: "Status",
      cell: ({ row }) => {
        const isBanned = row.getValue("isBanned") as boolean;
        return (
          <Badge variant={isBanned ? "destructive" : "outline"}>
            {isBanned ? (
              <>
                <UserX className="mr-1 h-3 w-3" />
                Banned
              </>
            ) : (
              <>
                <UserCheck className="mr-1 h-3 w-3" />
                Active
              </>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 -ml-2"
        >
          <Calendar className="mr-1 h-4 w-4" />
          Joined
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <span className="text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-muted">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email)}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggleBan(user.id, !user.isBanned)}
                className="text-sm"
              >
                {user.isBanned ? (
                  <>
                    <UserCheck className="mr-2 h-3.5 w-3.5" />
                    Unban user
                  </>
                ) : (
                  <>
                    <UserX className="mr-2 h-3.5 w-3.5" />
                    Ban user
                  </>
                )}
              </DropdownMenuItem>
              {user.role !== "ADMIN" && (
                <DropdownMenuItem
                  onClick={() => setDeleteUserId(user.id)}
                  className="text-red-600 text-sm"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete user
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    pageCount: totalPages,
    manualPagination: true,
  });

  const fetchUsers = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await getUsers(
        sessionId,
        pagination.pageIndex + 1,
        pagination.pageSize,
        globalFilter
      );

      if (response.error) {
        console.error("Error fetching users:", response.error);
        return;
      }

      if (response.users && response.pagination) {
        setData(response.users);
        setTotalPages(response.pagination.totalPages);
        setTotalUsers(response.pagination.totalUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    if (!sessionId) return;

    try {
      const response = await toggleUserBan(sessionId, userId, isBanned);
      if (response.success) {
        fetchUsers(); // Refresh the data
      } else {
        console.error("Error toggling ban:", response.error);
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!sessionId || !deleteUserId) return;

    try {
      const response = await deleteUser(sessionId, deleteUserId);
      if (response.success) {
        fetchUsers(); // Refresh the data
        setDeleteUserId(null);
      } else {
        console.error("Error deleting user:", response.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sessionId, pagination.pageIndex, pagination.pageSize]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [globalFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions. Total users: {totalUsers}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex items-center py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-3">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalUsers)} of{" "}
            {totalUsers} users
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all their associated data including trips and itineraries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default UserDataTable;