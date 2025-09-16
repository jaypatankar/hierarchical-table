# Simple Hierarchical Table Website

## Live Preview
https://hierarchical-table-mu.vercel.app/

Overview
This is a ReactJS-based website that displays a hierarchical table with rows containing labels and values. Each row can have child rows, and changes to values automatically update subtotals and the grand total.

Features
- Hierarchical Rows – Supports multiple levels of parent-child rows.
- Value Updates – Each row has:
  - Input field for numeric values
  - Allocation % Button → increases value by entered percentage
  - Allocation Val Button → sets value directly
- Variance Calculation – Displays variance % compared to the original value.
- Automatic Subtotals – Child updates roll up to parent rows.
- Grand Total Row – Displays the sum of all values.
- Two-Way Update – Updating subtotals distributes changes down to child rows.

Tech Stack
- ReactJS (Frontend framework)
- TanStack Table (for table rendering)
- Vite (development & build tool)

Project Setup

1. Install dependencies:
   npm install

2. Run the development server:
   npm run dev

3. Open in your browser:
   http://localhost:5173

Demo
Table with hierarchical rows, input fields, and variance updates.
