import { useState } from 'react';

export const useFormState = () => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [coordinates, setCoordinates] = useState([]);
  const [newCoords, setNewCoords] = useState([]);
  const [coordError, setCoordError] = useState("");
  const [position, setPosition] = useState([33.233334, -8.500000]);

  return {
    selectedRegion,
    setSelectedRegion,
    selectedProvince,
    setSelectedProvince,
    selectedCity,
    setSelectedCity,
    coordinates,
    setCoordinates,
    newCoords,
    setNewCoords,
    coordError,
    setCoordError,
    position,
    setPosition,
  };
};

export default useFormState;



// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal } from "lucide-react";
// import api from "@/login/api";

// const columns = [
//   { accessorKey: "parcel_type", header: "Parcel Type", width: 120 },
//   { accessorKey: "name", header: "Name", width: 150, enableSorting: true },
//   { accessorKey: "region", header: "Region", width: 120, enableSorting: true },
//   { accessorKey: "province", header: "Province", width: 120, enableSorting: true },
//   { accessorKey: "city", header: "City", width: 120, enableSorting: true },
//   { accessorKey: "situation", header: "Situation", width: 150, enableSorting: true },
//   { accessorKey: "land_reference", header: "Land Reference", width: 180, enableSorting: true },
//   { accessorKey: "area", header: "Area", width: 100, enableSorting: true },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const parcel = row.original;
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem
//               onClick={() => navigator.clipboard.writeText(parcel.id)}
//             >
//               Copy Parcel ID
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>View Details</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//     width: 100,
//   },
// ];

// export default function Parcel() {
//   const [data, setData] = useState([]);
//   const [totalItems, setTotalItems] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [page, setPage] = useState(0);
//   const [columnFilters, setColumnFilters] = useState([]);
//   const [columnVisibility, setColumnVisibility] = useState({});
//   const [sorting, setSorting] = useState([]);

//   const fetchData = async () => {
//     try {
//       const response = await api.get(`parcel/list/?page=${page + 1}&page_size=${pageSize}`);
//       setData(response.data.results);
//       setTotalItems(response.data.count);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [page, pageSize]);

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onSortingChange: setSorting,
//     state: {
//       columnFilters,
//       columnVisibility,
//       sorting,
//     },
//     manualPagination: true,
//     pageCount: Math.ceil(totalItems / pageSize),
//   });

//   return (
//     <div>
//       <div className="flex items-center py-4">
//         <Input
//           placeholder="Filter parcels..."
//           value={(table.getColumn("name")?.getFilterValue() ?? "")}
//           onChange={(event) =>
//             table.getColumn("name")?.setFilterValue(event.target.value)
//           }
//           className="max-w-sm"
//         />
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" className="ml-auto">
//               Columns
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             {table.getAllColumns().map((column) => (
//               <DropdownMenuCheckboxItem
//                 key={column.id}
//                 className="capitalize"
//                 checked={column.getIsVisible()}
//                 onCheckedChange={(value) => column.toggleVisibility(!!value)}
//               >
//                 {column.columnDef?.header || column.id}
//               </DropdownMenuCheckboxItem>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//       <div className="rounded-md border overflow-x-auto">
//         <Table className="table-fixed">
//           <TableHead>
//             <TableRow>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <React.Fragment key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <TableCell
//                       key={header.id}
//                     //   style={{ width: columns.find(col => col.accessorKey === header.column.id)?.width }}
//                       onClick={header.column.getToggleSortingHandler()}
//                       className={
//                         header.column.getIsSorted()
//                           ? header.column.getIsSorted() === "asc"
//                             ? "sorting-asc"
//                             : "sorting-desc"
//                           : ""
//                       }
//                     >
//                       {header.columnDef?.header || header.id}
//                       {header.column.getIsSorted() ? (
//                         header.column.getIsSorted() === "asc" ? " ↑" : " ↓"
//                       ) : null}
//                     </TableCell>
//                   ))}
//                 </React.Fragment>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {table.getRowModel().rows.map((row) => (
//               <TableRow key={row.id}>
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell
//                     key={cell.id}
//                   >
//                     {cell.getValue()}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//       <div className="flex justify-end gap-3 py-4">
//         <Button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
//           Previous
//         </Button>
//         <Button
//           onClick={() => setPage((prev) => (prev + 1 < table.getPageCount() ? prev + 1 : prev))}
//           disabled={page >= table.getPageCount() - 1}
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// }
