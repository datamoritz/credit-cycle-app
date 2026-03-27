# Private local data

Files in this directory that match `*.local.json` are gitignored and never committed.

## Setup

```bash
cp cards.local.json.example       cards.local.json
cp statements.local.json.example  statements.local.json
```

Edit both files with your real data and start the dev server. The app will log:

```
[loadData] Using private cards data (N cards)
[loadData] Using private statements data (N statements)
```

If either file is missing, the app silently falls back to the committed demo data.

---

## cards.local.json schema

Array of card objects. All fields required unless marked optional.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique slug. Used as URL param and foreign key in statements. e.g. `"amex"`, `"chase-freedom"` |
| `name` | `string` | Full card product name. e.g. `"Blue Cash Preferred"` |
| `issuer` | `string` | Bank/issuer name shown in the UI. e.g. `"American Express"` |
| `last4` | `string` | Last 4 digits of the card number (display only) |
| `color` | `enum` | UI color theme. One of: `"blue"` `"orange"` `"teal"` `"red"` `"purple"` `"green"` |
| `creditLimit` | `number` | Total credit limit in USD |
| `currentBalance` | `number` | Current balance as of data entry |
| `availableCredit` | `number` | `creditLimit − currentBalance` |
| `utilization` | `number` | `currentBalance / creditLimit × 100` (0–100) |
| `statementCloseDay` | `number` | Day of month the statement closes (1–31) |
| `dueDay` | `number` | Day of month the payment is due in the following month |
| `postingBufferDays` | `number` | Days before close a payment must post to count. Typically 2–3. Used to compute `recommendedPayByDate`. |
| `nextCloseDate` | `string` | ISO date `"YYYY-MM-DD"` — next upcoming statement close |
| `nextDueDate` | `string` | ISO date `"YYYY-MM-DD"` — next payment due date |
| `recommendedPayByDate` | `string` | ISO date `"YYYY-MM-DD"` — `nextCloseDate` minus `postingBufferDays`. Pay by this date to reduce FICO-reported utilization. |
| `minimumPayment` | `number` | Current minimum payment due in USD |
| `apr` | `number` | Annual percentage rate. e.g. `19.99` |
| `rewards` | `string` | *(optional)* Rewards description. e.g. `"3% dining"` |

---

## statements.local.json schema

Array of statement objects. All fields required unless marked optional.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier. Suggested format: `"{cardId}-{YYYY-MM}"`. e.g. `"amex-2026-02"` |
| `cardId` | `string` | Must match an `id` in `cards.local.json` |
| `statementMonth` | `string` | `"YYYY-MM"` — the month this statement covers. e.g. `"2026-03"` |
| `closingDate` | `string` | ISO date `"YYYY-MM-DD"` — when the statement closed |
| `dueDate` | `string` | ISO date `"YYYY-MM-DD"` — when payment is due. **This determines which month's summary the statement appears in.** |
| `statementBalance` | `number` | Total balance on the statement in USD |
| `minimumPayment` | `number` | Minimum payment due |
| `paidAmount` | `number` | Amount paid so far. `0` if unpaid. |
| `paidDate` | `string` | *(optional)* ISO date when payment was made. Omit if unpaid. |
| `remainingAmount` | `number` | `statementBalance − paidAmount`. Set to `0` when fully paid. |
| `status` | `enum` | `"paid_in_full"` · `"partially_paid"` · `"unpaid"` · `"pending"` |
| `isProjected` | `boolean` | *(optional)* `true` = future estimate, not a real closed statement |

### Status values

| Value | Meaning |
|---|---|
| `"paid_in_full"` | Fully paid — `remainingAmount` should be `0` |
| `"partially_paid"` | Some paid, some still owed |
| `"unpaid"` | Statement closed, nothing paid yet |
| `"pending"` | Statement hasn't closed yet (future/projected) |

### Tips

- Include 3–6 months of history per card for useful views.
- Always include at least 2 future `"pending"` months so the Monthly and Timeline views show upcoming obligations.
- The Monthly Summary page groups statements by their `dueDate` month, not `closingDate` month.

---

## Postgres migration notes

These shapes map directly to two tables:

**`credit_cards`** — from `cards.local.json`
Use snake_case columns: `credit_limit`, `current_balance`, `available_credit`, `utilization`, `statement_close_day`, `due_day`, `posting_buffer_days`, `next_close_date`, `next_due_date`, `recommended_pay_by_date`, `minimum_payment`, `apr`, `rewards`.

**`statements`** — from `statements.local.json`
Foreign key: `card_id → credit_cards.id`
Recommended indexes: `(card_id, statement_month)`, `(due_date)`, `(status)`

When moving to Postgres, update `lib/loadData.ts` — it is the single file that needs to change.
