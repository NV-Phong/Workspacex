"use client";

import * as React from "react";
import {
   DndContext,
   KeyboardSensor,
   MouseSensor,
   TouchSensor,
   closestCenter,
   useSensor,
   useSensors,
   type DragEndEvent,
   type UniqueIdentifier,
   DragOverlay,
   useDraggable,
   useDroppable,
   DragStartEvent,
   DragOverEvent,
   defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
   restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
   SortableContext,
   arrayMove,
   useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
   IconChevronDown,
   IconChevronLeft,
   IconChevronRight,
   IconChevronsLeft,
   IconChevronsRight,
   IconCircleCheckFilled,
   IconGripVertical,
   IconLayoutColumns,
   IconLoader,
   IconPlus,
} from "@tabler/icons-react";
import {
   ColumnDef,
   ColumnFiltersState,
   SortingState,
   VisibilityState,
   flexRender,
   getCoreRowModel,
   getFacetedRowModel,
   getFacetedUniqueValues,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { useGetStatuses } from "@/hooks/status/use-get-statuses";
import { useGetTasks } from "@/hooks/task/use-get-tasks";
import { useUpdateTask } from "@/hooks/task/use-update-task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTaskPopover } from "@/components/form/create-task";
import { Icon } from "@/components/ui-engineer/Icon";

export const schema = z.object({
   id: z.string(),
   header: z.string(),
   type: z.string(),
   status: z.string(),
   target: z.string(),
   limit: z.string(),
   reviewer: z.string(),
   description: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
   const { attributes, listeners, setNodeRef, transform } = useSortable({ id });
   const style = {
      transform: CSS.Transform.toString(transform),
   };

   return (
      <Button
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         variant="ghost"
         size="icon"
         className="cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-800"
      >
         <IconGripVertical className="h-5 w-5 text-gray-400" />
         <span className="sr-only">Drag to reorder</span>
      </Button>
   );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
   {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
   },
   {
      id: "select",
      header: ({ table }) => (
         <div className="flex items-center justify-center">
            <Checkbox
               checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
               }
               onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
               }
               aria-label="Select all"
            />
         </div>
      ),
      cell: ({ row }) => (
         <div className="flex items-center justify-center">
            <Checkbox
               checked={row.getIsSelected()}
               onCheckedChange={(value) => row.toggleSelected(!!value)}
               aria-label="Select row"
            />
         </div>
      ),
      enableSorting: false,
      enableHiding: false,
   },
   {
      accessorKey: "header",
      header: "Task Name",
      cell: ({ row }) => {
         return <TableCellViewer item={row.original} />;
      },
      enableHiding: false,
   },
   {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
         <div className="w-64 truncate" title={row.original.description}>
            {row.original.description}
         </div>
      ),
   },
   {
      accessorKey: "type",
      header: "Priority",
      cell: ({ row }) => (
         <div className="w-32">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
               {row.original.type}
            </Badge>
         </div>
      ),
   },
   {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
         <div className="w-32">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
               {row.original.status}
            </Badge>
         </div>
      ),
   },
   {
      accessorKey: "target",
      header: "Project",
      cell: ({ row }) => (
         <div className="w-32 truncate" title={row.original.target}>
            {row.original.target}
         </div>
      ),
   },
   {
      accessorKey: "limit",
      header: "Created At",
      cell: ({ row }) => (
         <div className="w-32 truncate" title={row.original.limit}>
            {row.original.limit}
         </div>
      ),
   },
   {
      accessorKey: "reviewer",
      header: "Assignee",
      cell: ({ row }) => (
         <div className="w-32 truncate" title={row.original.reviewer}>
            {row.original.reviewer}
         </div>
      ),
   },
   {
      id: "actions",
      cell: () => (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <Icon
                     name="setup-01-solid-standard"
                     size={20}
                     className="opacity-70 hover:opacity-100"
                  />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem>View</DropdownMenuItem>
               <DropdownMenuItem>Edit</DropdownMenuItem>
               <DropdownMenuItem className="text-red-600">
                  Remove
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      ),
   },
];

// Thêm component KanbanCard
function KanbanCard({
   item,
   isDraggingOver,
   style,
}: {
   item: z.infer<typeof schema>;
   isDraggingOver?: boolean;
   style?: React.CSSProperties;
}) {
   const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: item.id,
   });

   const styleProp = transform
      ? {
           transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

   return (
      <div
         ref={setNodeRef}
         {...attributes}
         {...listeners}
         style={{ ...styleProp, ...style }}
         className={`bg-background rounded-lg border shadow-sm p-3 mb-3 ${
            isDraggingOver ? "opacity-50" : ""
         }`}
      >
         <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium truncate text-base flex-grow pr-2">
               {item.header}
            </h3>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                     <Icon
                        name="setup-01-solid-standard"
                        size={20}
                        className="opacity-70 hover:opacity-100"
                     />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem>View</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                     Remove
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
         <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-10 overflow-hidden">
            {item.description}
         </p>
         <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-muted">
            <span className="truncate">{item.reviewer}</span>
            <Badge variant="outline" className="text-xs px-2">
               {item.type}
            </Badge>
         </div>
      </div>
   );
}

// Thêm component KanbanColumn
function KanbanColumn({
   status,
   items,
}: {
   status: string;
   items: z.infer<typeof schema>[];
}) {
   const { setNodeRef, isOver } = useDroppable({
      id: status,
   });

   const getColumnStyle = (status: string) => {
      switch (status) {
         case "To Do":
            return {
               color: "text-gray-400",
               bgColor: "bg-gray-50 dark:bg-gray-800/20",
               borderColor: "border-gray-100 dark:border-gray-700",
               icon: <IconLayoutColumns className="h-4 w-4" />,
               headerBg: "bg-gray-100/50 dark:bg-gray-800/40",
            };
         case "In Progress":
            return {
               color: "text-blue-400",
               bgColor: "bg-blue-50 dark:bg-blue-900/10",
               borderColor: "border-blue-100 dark:border-blue-800",
               icon: <IconLoader className="h-4 w-4 animate-spin" />,
               headerBg: "bg-blue-100/50 dark:bg-blue-900/20",
            };
         case "In Review":
            return {
               color: "text-amber-400",
               bgColor: "bg-amber-50 dark:bg-amber-900/10",
               borderColor: "border-amber-100 dark:border-amber-800",
               icon: (
                  <svg
                     className="h-4 w-4"
                     viewBox="0 0 24 24"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                     <path
                        d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  </svg>
               ),
               headerBg: "bg-amber-100/50 dark:bg-amber-900/20",
            };
         case "Done":
            return {
               color: "text-green-400",
               bgColor: "bg-green-50 dark:bg-green-900/10",
               borderColor: "border-green-100 dark:border-green-800",
               icon: <IconCircleCheckFilled className="h-4 w-4" />,
               headerBg: "bg-green-100/50 dark:bg-green-900/20",
            };
         default:
            return {
               color: "text-gray-400",
               bgColor: "bg-gray-50 dark:bg-gray-800/20",
               borderColor: "border-gray-100 dark:border-gray-700",
               icon: <IconLayoutColumns className="h-4 w-4" />,
               headerBg: "bg-gray-100/50 dark:bg-gray-800/40",
            };
      }
   };

   const columnStyle = getColumnStyle(status);

   return (
      <div className="flex flex-col gap-2">
         <div className="flex items-center justify-between">
            <h3 className="font-medium">{status}</h3>
            <span className="text-sm text-muted-foreground">
               {items.length}
            </span>
         </div>
         <div
            ref={setNodeRef}
            className={`flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto p-3 rounded-lg transition-colors duration-200 border ${
               columnStyle.borderColor
            } ${
               isOver
                  ? "bg-[var(--selection)]/10 ring-2 ring-[var(--selection)]"
                  : columnStyle.bgColor
            }`}
         >
            {items.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                  <svg
                     className="h-8 w-8 opacity-50"
                     viewBox="0 0 24 24"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        d="M8 12.2H15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                     <path
                        d="M8 16.2H12.38"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                     <path
                        d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                     <path
                        d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  </svg>
                  <p>No tasks</p>
                  <CreateTaskPopover>
                     <Button variant="outline" size="sm" className="mt-2">
                        <IconPlus className="h-3 w-3 mr-1" />
                        New task
                     </Button>
                  </CreateTaskPopover>
               </div>
            ) : (
               items.map((item) => (
                  <KanbanCard
                     key={item.id}
                     item={item}
                     isDraggingOver={isOver}
                  />
               ))
            )}
         </div>
      </div>
   );
}

export function DataTable({
   data: initialData,
}: {
   data: z.infer<typeof schema>[];
}) {
   const [data, setData] = React.useState(initialData);
   const { tasks } = useGetTasks();
   const { updateTask } = useUpdateTask();

   React.useEffect(() => {
      if (tasks.length > 0) {
         // Map the task data to match the schema expected by the table
         const mappedData = tasks.map((task) => ({
            id: task.IDTask.toString(), // Convert to string to avoid NaN issues
            header: task.TaskName,
            type: task.project?.ProjectName || "Unknown",
            status: task.status?.Status || "Unknown",
            target: task.StartDay || "Not set",
            limit: task.EndDay || "Not set",
            reviewer: task.assignee?.DisplayName || "Unassigned",
            description: task.TaskDescription || "No description",
         }));
         setData(mappedData);
      }
   }, [tasks]);

   const { statuses, isLoading: statusesLoading } = useGetStatuses();
   const [rowSelection, setRowSelection] = React.useState({});
   const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({});
   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
   );
   const [sorting, setSorting] = React.useState<SortingState>([]);
   const [pagination, setPagination] = React.useState({
      pageIndex: 0,
      pageSize: 10,
   });

   const table = useReactTable({
      data,
      columns,
      state: {
         sorting,
         columnVisibility,
         rowSelection,
         columnFilters,
         pagination,
      },
      getRowId: (row) => row.id.toString(),
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
   });

   const [draggedId, setDraggedId] = React.useState<UniqueIdentifier | null>(
      null
   );
   const [isDragging, setIsDragging] = React.useState(false);
   const [dropTargetId, setDropTargetId] = React.useState<UniqueIdentifier | null>(null);
   const [activeTask, setActiveTask] = React.useState<z.infer<
      typeof schema
   > | null>(null);

   const sensors = useSensors(
      useSensor(MouseSensor),
      useSensor(TouchSensor),
      useSensor(KeyboardSensor)
   );

   const handleDragStart = (event: DragStartEvent) => {
      setDraggedId(event.active.id);
      setIsDragging(true);
      // Find the task being dragged to display in the overlay
      const task = data.find((item) => item.id === event.active.id);
      if (task) {
         setActiveTask(task);
      }
   };

   const handleDragOver = (event: DragOverEvent) => {
      setDropTargetId(event.over?.id || null);
   };

   const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over) {
         if (
            typeof over.id === "string" &&
            statuses.some((status) => status.Status === over.id)
         ) {
            // Cập nhật status khi kéo vào cột mới
            const newStatus = over.id as string;
            const taskId = active.id as string;
            console.log("Attempting to update status to:", newStatus);
            console.log("Available statuses:", statuses);
            // Find the status ID corresponding to the status name
            const statusObj = statuses.find(
               (status) => status.Status === newStatus
            );
            console.log("Found status object:", statusObj);
            if (statusObj && statusObj.IDStatus) {
               console.log("Updating task with IDStatus:", statusObj.IDStatus);
               try {
                  await updateTask(taskId, {
                     IDStatus: String(statusObj.IDStatus),
                  });
                  // Update local data to reflect the status change immediately for a smoother UX
                  setData((prevData) => {
                     const updatedData = [...prevData];
                     const taskIndex = updatedData.findIndex(
                        (item) => item.id === active.id
                     );
                     if (taskIndex !== -1) {
                        updatedData[taskIndex] = {
                           ...updatedData[taskIndex],
                           status: newStatus,
                        };
                     }
                     return updatedData;
                  });
               } catch (error) {
                  console.error("Failed to update task:", error);
               }
            } else {
               console.log(
                  "Invalid status ID or status not found for:",
                  newStatus
               );
            }
         } else {
            // Sắp xếp lại thứ tự trong cùng một cột
            setData((prevData) => {
               const activeIndex = prevData.findIndex(
                  (item) => item.id === active.id
               );
               const overIndex = over
                  ? prevData.findIndex((item) => item.id === over.id)
                  : activeIndex;
               return activeIndex !== overIndex
                  ? arrayMove(prevData, activeIndex, overIndex)
                  : prevData;
            });
         }
      }

      setDraggedId(null);
      setIsDragging(false);
      setDropTargetId(null);
      setActiveTask(null);
   };

   // Cấu hình hiệu ứng thả
   const dropAnimation = {
      duration: 250, // Giảm thời gian animation để cảm giác mượt mà hơn
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      sideEffects: defaultDropAnimationSideEffects({
         styles: {
            active: {
               opacity: "1",
               transform: "scale(1.02)",
               boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
               borderRadius: "8px",
               willChange: "transform, opacity", // Thêm willChange để tối ưu rendering
            },
            dragOverlay: {
               transform: "scale(1)",
               opacity: "1",
               boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
               transition: "transform 0.2s ease-out, opacity 0.2s ease-out", // Giảm thời gian transition
               borderRadius: "8px",
               willChange: "transform, opacity", // Thêm willChange để tối ưu rendering
            },
         },
      }),
   };

   // Sử dụng isDragging để thêm class cho container
   const containerClassName = isDragging ? "cursor-grabbing" : "cursor-default";

   return (
      <Tabs
         defaultValue="kanban"
         className={`w-full flex-col justify-start gap-6 ${containerClassName}`}
      >
         <div className="flex items-center justify-between px-4 lg:px-6">
            <Label htmlFor="view-selector" className="sr-only">
               View
            </Label>
            <Select defaultValue="list">
               <SelectTrigger
                  className="flex w-fit @4xl/main:hidden"
                  size="sm"
                  id="view-selector"
               >
                  <SelectValue placeholder="Select a view" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="kanban">Kanban Board</SelectItem>
               </SelectContent>
            </Select>
            <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
               <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
               <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="sm">
                        <IconLayoutColumns />
                        <span className="hidden lg:inline">
                           Customize Columns
                        </span>
                        <span className="lg:hidden">Columns</span>
                        <IconChevronDown />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                     {table
                        .getAllColumns()
                        .filter(
                           (column) =>
                              typeof column.accessorFn !== "undefined" &&
                              column.getCanHide()
                        )
                        .map((column) => {
                           return (
                              <DropdownMenuCheckboxItem
                                 key={column.id}
                                 className="capitalize"
                                 checked={column.getIsVisible()}
                                 onCheckedChange={(value: boolean) =>
                                    column.toggleVisibility(!!value)
                                 }
                              >
                                 {column.id}
                              </DropdownMenuCheckboxItem>
                           );
                        })}
                  </DropdownMenuContent>
               </DropdownMenu>
               <Button variant="outline" size="sm">
                  <IconPlus />
                  <span className="hidden lg:inline">Add Section</span>
               </Button>
            </div>
         </div>
         <TabsContent
            value="list"
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
         >
            <div className="overflow-hidden rounded-lg border">
               <DndContext
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
               >
                  <Table className="w-full border-separate border-spacing-0">
                     <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                           <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => (
                                 <TableHead
                                    key={header.id}
                                    className="border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                                 >
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
                     <TableBody className="bg-white dark:bg-gray-950">
                        <SortableContext items={data.map((item) => item.id)}>
                           {table.getRowModel().rows?.length ? (
                              table.getRowModel().rows.map((row) => (
                                 <TableRow
                                    key={row.id}
                                    data-state={
                                       row.getIsSelected() && "selected"
                                    }
                                    className={`border-b border-gray-200 dark:border-gray-800 transition-all duration-200 ease-in-out ${
                                       isDragging && draggedId === row.original.id
                                          ? 'opacity-30 shadow-lg bg-gray-100 dark:bg-gray-800 z-20 relative transform scale-105'
                                          : ''
                                    } ${
                                       dropTargetId === row.original.id && draggedId !== row.original.id
                                          ? 'border-dashed border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                                          : ''
                                    }`}
                                 >
                                    {row.getVisibleCells().map((cell) => (
                                       <TableCell
                                          key={cell.id}
                                          className="py-2 px-4"
                                       >
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
                                 <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                 >
                                    No results.
                                 </TableCell>
                              </TableRow>
                           )}
                        </SortableContext>
                     </TableBody>
                  </Table>
                  <DragOverlay dropAnimation={dropAnimation}>
                     {activeTask ? (
                        <Table className="w-full border-separate border-spacing-0 opacity-100 shadow-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                           <TableBody>
                              <TableRow className="border-b border-gray-200 dark:border-gray-700 transform scale-102">
                                 <TableCell className="py-2 px-4 w-8">
                                    <IconGripVertical className="h-5 w-5 text-gray-400" />
                                 </TableCell>
                                 <TableCell className="py-2 px-4 font-medium">
                                    {activeTask.header}
                                 </TableCell>
                                 <TableCell className="py-2 px-4">
                                    {activeTask.type}
                                 </TableCell>
                                 <TableCell className="py-2 px-4">
                                    <Badge
                                       variant="outline"
                                       className="text-muted-foreground px-1.5"
                                    >
                                       {activeTask.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="py-2 px-4">
                                    {activeTask.target}
                                 </TableCell>
                                 <TableCell className="py-2 px-4">
                                    {activeTask.limit}
                                 </TableCell>
                                 <TableCell className="py-2 px-4">
                                    {activeTask.reviewer}
                                 </TableCell>
                              </TableRow>
                           </TableBody>
                        </Table>
                     ) : null}
                  </DragOverlay>
               </DndContext>
            </div>
            <div className="flex items-center justify-between px-4">
               <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
               </div>
               <div className="flex w-full items-center gap-8 lg:w-fit">
                  <div className="hidden items-center gap-2 lg:flex">
                     <Label
                        htmlFor="rows-per-page"
                        className="text-sm font-medium"
                     >
                        Rows per page
                     </Label>
                     <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                           table.setPageSize(Number(value));
                        }}
                     >
                        <SelectTrigger
                           size="sm"
                           className="w-20"
                           id="rows-per-page"
                        >
                           <SelectValue
                              placeholder={table.getState().pagination.pageSize}
                           />
                        </SelectTrigger>
                        <SelectContent side="top">
                           {[10, 20, 30, 40, 50].map((pageSize) => (
                              <SelectItem key={pageSize} value={`${pageSize}`}>
                                 {pageSize}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="flex w-fit items-center justify-center text-sm font-medium">
                     Page {table.getState().pagination.pageIndex + 1} of{" "}
                     {table.getPageCount()}
                  </div>
                  <div className="ml-auto flex items-center gap-2 lg:ml-0">
                     <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                     >
                        <span className="sr-only">Go to first page</span>
                        <IconChevronsLeft />
                     </Button>
                     <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                     >
                        <span className="sr-only">Go to previous page</span>
                        <IconChevronLeft />
                     </Button>
                     <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                     >
                        <span className="sr-only">Go to next page</span>
                        <IconChevronRight />
                     </Button>
                     <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() =>
                           table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                     >
                        <span className="sr-only">Go to last page</span>
                        <IconChevronsRight />
                     </Button>
                  </div>
               </div>
            </div>
         </TabsContent>
         <TabsContent
            value="kanban"
            className="flex flex-col gap-4 px-4 lg:px-6"
         >
            {statusesLoading ? (
               <div className="flex items-center justify-center p-8">
                  <IconLoader className="h-6 w-6 animate-spin" />
               </div>
            ) : (
               <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToWindowEdges]}
                  autoScroll={true}
               >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                     {statuses.map((status) => (
                        <KanbanColumn
                           key={status.IDStatus}
                           status={status.Status}
                           items={data.filter(
                              (item) => item.status === status.Status
                           )}
                        />
                     ))}
                  </div>
                  <DragOverlay dropAnimation={dropAnimation}>
                     {activeTask ? (
                        <KanbanCard
                           item={activeTask}
                           style={{
                              opacity: 1,
                              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                              borderRadius: "8px",
                              transform: "scale(1.02)",
                           }}
                        />
                     ) : null}
                  </DragOverlay>
               </DndContext>
            )}
         </TabsContent>
      </Tabs>
   );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
   const isMobile = useIsMobile();

   if (isMobile) {
      return (
         <div className="flex flex-col gap-1 py-1.5">
            <span className="truncate font-medium" title={item.header}>
               {item.header}
            </span>
            <span
               className="truncate text-sm text-muted-foreground"
               title={item.description}
            >
               {item.description}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span>{item.target}</span>
               <span>&bull;</span>
               <span>{item.reviewer}</span>
            </div>
         </div>
      );
   }

   return (
      <span className="truncate font-medium" title={item.header}>
         {item.header}
      </span>
   );
}
