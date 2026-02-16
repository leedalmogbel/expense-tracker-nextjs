# Dosh Mate – Workflow integration checklist

Use this checklist to apply the same expense-tracking flow (Add Expense, Add Budget, Add Income, index display) in another system (e.g. mobile app or another web app).

---

## 1. Add Expense

- **Form fields:** Amount, Description, Date, Category, Payment Method.
- **Category mapping:** Use a value (e.g. `dine-out`, `food-drink`) in the form; store the **display label** (e.g. "Dine Out", "Food & Drink") and icon key. Filtering compares normalized value (slug) to stored label via a shared normalizer.
- **Validation:** Amount &gt; 0, required: description, date, category. Optional: notes.
- **Storage:** Save as **negative** amount and `isPositive: false`. Category stored as display label. Persist `id`, `createdAt`, `updatedAt`, `paymentMethod`, `icon`.

---

## 2. Add Budget

- **Form fields:** Monthly Budget (total), Month (1–12), Year.
- **Default category splits:** When no existing budget for that month, use default percentages (e.g. Food 20%, Shopping 30%, Transport 10%, etc.) to build `categoryBudgets` from the total.
- **Reuse existing:** If a budget already exists for the selected month/year, load it (total and category amounts) and allow editing; optionally scale category amounts if the user changes the total.
- **Storage:** Call `setCurrentBudget(budget)`. Persist in `monthly_budgets` and set as `current_budget` when the budget’s year/month match the “current” month.

---

## 3. Add Income

- **Form fields:** Amount, Month, Year (no free-form date).
- **Description:** Use a fixed pattern: `"Income - {MonthName} {Year}"` (e.g. "Income - February 2026").
- **Storage:** Positive amount, `isPositive: true`. Fixed `paymentMethod: "Bank Transfer"`. Transaction date can be the first day of the selected month (`YYYY-MM-01`).

---

## 4. Index / Overview display

- **Budget/expense cards:** Show monthly budget total, spent this month, spent today, and a progress bar (and over-budget state if applicable).
- **Summary cards:** Total income and total expenses for the current (or selected) month; optional total balance/savings.
- **Calendar:** Current week dates (e.g. Sun–Sat) with “today” highlighted.
- **Bar chart:** Last 7 months (income/expenses or expenses only). **Bar press:** set month filter so transactions and summaries below reflect the selected month; provide a “Clear filter” control.
- **Transactions list:** Grouped by date with labels “Today”, “Yesterday”, or “15 Jan”. Each row: icon, description, category, ±amount (green for income, red for expense).
- **Transaction filter:** Category pills (All + one per category); total or count for filtered list. Filter uses normalized category value for comparison with stored labels.
- **Date helpers:** e.g. `formatRelativeDate(dateStr)`, `getCurrentWeekDates()`, `getMonthName(month)`, `getCurrentYearMonth()`.
- **Currency:** Single `formatCurrency(amount)` (with symbol and ± prefix).

---

## 5. Category mapping

- **Value → label:** Form and filter use a **slug** (e.g. `food-drink`). Storage and display use the **label** (e.g. "Food & Drink"). Provide `getCategoryValue(label)` and `getCategoryLabel(value)` so both directions stay in sync.
- **Icons:** Map each category label to an icon key; UI maps that key to an icon component. Filtering: normalize stored `category` (label) to the same slug as the filter value for comparison.

---

## 6. Integration steps (another system)

1. **Data layer:** Define `Transaction` (id, description, category, amount, icon, date, isPositive, paymentMethod, createdAt, updatedAt) and `MonthlyBudget` (year, month, budget, categoryBudgets). Implement get/set for transactions, current budget, and optional monthly budgets list.
2. **Categories & payment methods:** Define CATEGORIES (labels), CATEGORY_ICONS (label → icon key), PAYMENT_METHODS, and value↔label helpers. Add default category budget splits (e.g. DEFAULT_CATEGORY_BUDGETS).
3. **Add Expense:** Implement form with validation; on submit, store expense as negative amount and `isPositive: false`, category as label.
4. **Add Budget:** Implement form (total, month, year). Load existing budget for that month if any; otherwise build categoryBudgets from default splits. Persist via setCurrentBudget and monthly budgets list.
5. **Add Income:** Implement form (amount, month, year). Create transaction with description `"Income - {Month} {Year}"`, positive amount, `isPositive: true`, paymentMethod `"Bank Transfer"`, date = first of month.
6. **Add button / menu:** Single “Add” entry point with three actions: Add Expense, Add Budget, Add Income (each opens the corresponding form/modal).
7. **Overview UI:** Budget/expense cards, summary cards, week calendar, 7‑month bar chart (with bar-press month filter), transaction list grouped by date, category filter pills and total.
8. **Utilities:** Date helpers (relative date, week dates, month name, current year/month), currency formatter, and category normalizer for filtering.

---

## 7. File reference (this app)

- **Types:** `lib/types.ts` (Transaction, MonthlyBudget, CategoryBudget).
- **Storage:** `lib/storage.ts` (transactions, current/monthly budgets).
- **Constants:** `lib/constants.ts` (CATEGORIES, CATEGORY_ICONS, PAYMENT_METHODS, DEFAULT_CATEGORY_BUDGETS, getCategoryValue, getCategoryLabel).
- **Utils:** `lib/expense-utils.ts` (filter by month, sum income/expenses, chart data, budget progress, formatRelativeDate, getSpentToday, groupTransactionsByDate, getChartDataLast7Months, getMonthName, getCurrentWeekDates).
- **Context:** `contexts/expense-context.tsx` (state, filters, addTransaction, setCurrentBudget, formatCurrency, etc.).
- **Modals:** `components/dashboard/add-expense-modal.tsx`, `add-budget-modal.tsx`, `add-income-modal.tsx`.
- **UI:** Budget/expense cards, stat cards, week calendar, 7‑month bar chart, transaction list with date groups and category filter.
