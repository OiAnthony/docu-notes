import type { Column } from "@tanstack/react-table"

export function useColumnSorting<TData>(column: Column<TData>) {
  const isSorted = column.getIsSorted()

  const handleSort = () => {
    if (isSorted === false) {
      column.toggleSorting(false) // asc
    } else if (isSorted === "asc") {
      column.toggleSorting(true) // desc
    } else {
      column.clearSorting() // clear
    }
  }

  return {
    isSorted,
    handleSort,
  }
} 
