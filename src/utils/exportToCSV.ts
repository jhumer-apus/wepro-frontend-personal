// src/utils/exportToCSV.ts

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  if (!data.length) {
    console.warn("No data to export");
    return;
  }

  const headers = columns.map(col => col.header);

  const rows = data.map(row =>
    columns.map(col => {
      const value = col.accessor(row);
      return value ?? "";
    })
  );

  const csvContent =
    [headers, ...rows]
      .map(row =>
        row
          .map(field =>
            `"${String(field).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

  // UTF-8 BOM for Excel support
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
