"use client"

import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { cx } from "@/lib/utils"
import { Schedule } from "@prisma/client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import cronstrue from "cronstrue"
import { LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import React, { useMemo, useState } from "react"

interface SchedulesTableProps {
  initialSchedules: Schedule[]
}

export function SchedulesTable({ initialSchedules }: SchedulesTableProps) {
  const [schedules] = React.useState<Schedule[]>(initialSchedules)
  const [activeView, setActiveView] = useState<"grid" | "list">("grid")

  const columns = useMemo<ColumnDef<Schedule>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableSorting: true,
        cell: ({ row }) => row.original.name,
      },
      {
        header: "Cron Expression",
        accessorKey: "cron",
        enableSorting: false,
        cell: ({ row }) => cronstrue.toString(row.original.cron),
      },
      {
        header: "Timezone",
        accessorKey: "timezone",
        enableSorting: false,
      },
      {
        header: "Status",
        accessorKey: "paused",
        enableSorting: true,
        cell: ({ getValue }) => {
          const isPaused = getValue<boolean>()
          return (
            <span
              className={cx(
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                isPaused
                  ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500"
                  : "bg-green-50 text-green-800 dark:bg-green-400/10 dark:text-green-500",
              )}
            >
              {isPaused ? "Paused" : "Active"}
            </span>
          )
        },
      },
      {
        header: "Linked Reporters",
        accessorKey: "ScheduleReporters",
        enableSorting: false,
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        enableSorting: true,
        cell: ({ getValue }) => {
          const date = getValue<Date>()
          if (!date) return "-"
          return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        },
      },
    ],
    [],
  )

  const table = useReactTable<Schedule>({
    data: schedules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (originalRow) => originalRow.id,
  })

  return (
    <div>
      <NavBar
        breadcrumbs={[
          { title: "Home", href: "/" },
          { title: "Schedules", href: "/schedules" },
        ]}
        viewToggle={{
          value: activeView,
          onChange: (value) => setActiveView(value as "grid" | "list"),
          options: [
            { value: "grid", icon: <LayoutGrid className="size-4" /> },
            { value: "list", icon: <List className="size-4" /> },
          ],
        }}
        actions={
          <Link href={`/schedules/new`}>
            <Button>Create</Button>
          </Link>
        }
      />

      {schedules.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No schedules found. Create your first schedule to get started.
        </div>
      ) : (
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as "grid" | "list")}
          className="w-full"
        >
          <TabsContent value="grid">
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => (
                <Link key={schedule.id} href={`/schedules/${schedule.id}`}>
                  <Card className="p-4 transition hover:bg-gray-50 dark:hover:bg-gray-900">
                    <h3 className="font-medium">{schedule.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {cronstrue.toString(schedule.cron)}
                      {", "}
                      {schedule.timezone.split("/").pop()} time
                    </p>
                    <div className="mt-4">
                      <span
                        className={cx(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          schedule.paused
                            ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500"
                            : "bg-green-50 text-green-800 dark:bg-green-400/10 dark:text-green-500",
                        )}
                      >
                        {schedule.paused ? "Paused" : "Active"}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <TableRoot>
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHeaderCell key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHeaderCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>

                <TableBody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          <Link href={`/schedules/${row.original.id}`}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Link>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
