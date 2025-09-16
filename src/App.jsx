import { useMemo, useState, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import "./App.css";
import {
  cloneData,
  calculateSubtotals,
  calculateVariance,
  updateParentValues,
  distributeToChildren,
  initialData,
} from "./lib/utils";

function App() {
  const [data, setData] = useState(() => {
    const copy = cloneData(initialData);
    copy.forEach(calculateSubtotals);
    copy.forEach(calculateVariance);
    return copy;
  });

  const [inputs, setInputs] = useState({});
  const inputRefs = useRef({});

  const handleInputChange = useCallback((id, value) => {
    console.log("Input changed:", id, value);
    setInputs((prev) => ({ ...prev, [id]: value }));
  }, []);

  const applyNewValue = useCallback(
    (id, newValue, distribute) => {
      console.log(
        "Applying new value:",
        id,
        newValue,
        "distribute:",
        distribute
      );

      const newData = cloneData(data);

      const updateNode = (node) => {
        if (node.id === id) {
          if (distribute && node.children?.length > 0) {
            distributeToChildren(node, newValue);
          } else {
            node.value = newValue;
          }
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (updateNode(child)) {
              updateParentValues(node);
              return true;
            }
          }
        }
        return false;
      };

      newData.forEach((n) => updateNode(n));
      newData.forEach(calculateVariance);
      console.log("Data after applying new value:", newData);

      setData(newData);

      setInputs((prev) => ({ ...prev, [id]: newValue.toFixed(2) }));
      inputRefs.current[id] = newValue.toFixed(2);
    },
    [data]
  );

  const applyAllocationPercent = useCallback(
    (row) => {
      const val = inputRefs.current[row.id] ?? inputs[row.id];
      console.log("Apply % clicked for", row.id, "value:", val);

      if (!val) return;
      const pct = parseFloat(val);
      if (isNaN(pct)) return;
      const newValue = row.value + (row.value * pct) / 100;
      applyNewValue(row.id, newValue, false);
    },
    [inputs, applyNewValue]
  );

  const applyAllocationValue = useCallback(
    (row) => {
      const val = inputRefs.current[row.id] ?? inputs[row.id];
      console.log("Apply Val clicked for", row.id, "value:", val);

      if (!val) return;
      const num = parseFloat(val);
      if (isNaN(num)) return;
      applyNewValue(row.id, num, true);
    },
    [inputs, applyNewValue]
  );

  const flatRows = useMemo(() => {
    const flatten = (nodes, depth = 0) => {
      return nodes.flatMap((node) => [
        { ...node, depth },
        ...(node.children ? flatten(node.children, depth + 1) : []),
      ]);
    };
    return flatten(data);
  }, [data]);

  const grandTotal = flatRows
    .filter((r) => r.depth === 0)
    .reduce((sum, r) => sum + r.value, 0);

  const columns = useMemo(
    () => [
      {
        header: "Label",
        accessorKey: "label",
        cell: (info) => {
          const row = info.row.original;
          return (
            <span style={{ paddingLeft: row.depth * 20 }}>{row.label}</span>
          );
        },
      },
      {
        header: "Value",
        accessorKey: "value",
        cell: (info) => info.getValue().toFixed(2),
      },
      {
        header: "Input",
        cell: (info) => {
          const row = info.row.original;
          return (
            <input
              type="number"
              defaultValue={inputs[row.id] ?? ""}
              ref={(el) => {
                if (el) inputRefs.current[row.id] = el;
              }}
              style={{ width: "80px" }}
            />
          );
        },
      },
      {
        header: "Allocation %",
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              onClick={() => {
                const val = inputRefs.current[row.id]?.value ?? inputs[row.id];
                if (!val) return;
                const pct = parseFloat(val);
                if (isNaN(pct)) return;
                const newValue = row.value + (row.value * pct) / 100;
                applyNewValue(row.id, newValue, false);
              }}
            >
              Apply %
            </button>
          );
        },
      },
      {
        header: "Allocation Val",
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              onClick={() => {
                const val = inputRefs.current[row.id]?.value ?? inputs[row.id];
                if (!val) return;
                const num = parseFloat(val);
                if (isNaN(num)) return;
                applyNewValue(row.id, num, true);
              }}
            >
              Apply Val
            </button>
          );
        },
      },
      {
        header: "Variance %",
        accessorKey: "variance",
        cell: (info) => info.getValue()?.toFixed(2) + "%",
      },
    ],
    [applyAllocationPercent, applyAllocationValue, handleInputChange]
  );

  const table = useReactTable({
    data: flatRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Hierarchical Allocation Table</h2>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, {
                    ...cell.getContext(),
                    inputs,
                  })}
                </td>
              ))}
            </tr>
          ))}
          <tr
            style={{ fontWeight: "bold", background: "#eee", color: "black" }}
          >
            <td>Grand Total</td>
            <td>{grandTotal.toFixed(2)}</td>
            <td colSpan={4}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
