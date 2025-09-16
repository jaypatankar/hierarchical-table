export function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

export function calculateSubtotals(node) {
  if (!node.children || node.children.length === 0) return node.value;
  node.value = node.children.reduce(
    (sum, child) => sum + calculateSubtotals(child),
    0
  );
  return node.value;
}

export function calculateVariance(node) {
  node.variance =
    ((node.value - node.originalValue) / node.originalValue) * 100;
  if (node.children) node.children.forEach(calculateVariance);
}

export function updateParentValues(node) {
  if (node.children && node.children.length > 0) {
    node.value = node.children.reduce((sum, c) => sum + c.value, 0);
  }
}

export function distributeToChildren(node, newValue) {
  if (!node.children || node.children.length === 0) {
    node.value = newValue;
    return;
  }

  const oldTotal = node.children.reduce((s, c) => s + c.value, 0);
  node.value = newValue;

  node.children.forEach((child) => {
    const ratio = child.value / oldTotal;
    distributeToChildren(child, newValue * ratio);
  });
}

export const initialData = [
  {
    id: "electronics",
    label: "Electronics",
    value: 1500,
    originalValue: 1500,
    children: [
      {
        id: "phones",
        label: "Phones",
        value: 800,
        originalValue: 800,
      },
      {
        id: "laptops",
        label: "Laptops",
        value: 700,
        originalValue: 700,
      },
    ],
  },
  {
    id: "furniture",
    label: "Furniture",
    value: 1000,
    originalValue: 1000,
    children: [
      {
        id: "tables",
        label: "Tables",
        value: 300,
        originalValue: 300,
      },
      {
        id: "chairs",
        label: "Chairs",
        value: 700,
        originalValue: 700,
      },
    ],
  },
];
