# Manager Dashboard — DEV

## 1. Project Overview

This project is a **DEV version of a Manager Dashboard** built from the Jira backlog provided in an Excel file.

The goal is to present Jira work information in a visual and easy-to-understand format so a manager can quickly see:

- Total tickets
- Ticket status
- Ticket priority
- Ticket type
- Assignee workload
- Ticket filtering
- Jira ticket links

The backend is implemented in **Python using FastAPI** and the frontend is a custom **HTML/CSS/JavaScript** dashboard.

> **Current scope:** DEV implementation only. Jira API integration and production deployment are not being implemented at this stage.

---

## 2. Current DEV Architecture

```text
Excel File
    |
    v
Python + Pandas
    |
    v
PostgreSQL
    |
    v
FastAPI
    |
    +------> Swagger / OpenAPI
    |        API testing & documentation
    |
    v
HTML + CSS + JavaScript
    |
    v
Manager Dashboard
```

---

## 3. Current Data

The DEV source file is:

```text
FB Perf Backlog - Recommended Tickets.xlsx
```

It contains **27 Jira tickets** and these fields:

```text
Group
Key
Summary
Status
Priority
Type
Creator
Reporter
Assignee
Created
Updated
Link
```

Current DEV counts:

```text
Total: 27

Status:
Open       13
Incoming   10
Accepted    4

Priority:
TBD   18
P1     3
P2     3
P3     3

Type:
Bug           14
Story          9
Improvement    4
```

---

## 4. Python and Pandas

Python is used for Excel processing, database interaction, and the backend API.

Pandas reads the Excel file:

```python
import pandas as pd

df = pd.read_excel(
    "data/FB Perf Backlog - Recommended Tickets.xlsx"
)
```

The Excel file was successfully loaded with:

```text
Number of tickets: 27
Number of columns: 12
```

OpenPyXL is used by Pandas to read `.xlsx` files.

---

## 5. PostgreSQL

### Version

```text
PostgreSQL 18.4
```

### Database

```text
manager_dashboard
```

### Main table

```text
tickets
```

Current table:

```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    jira_key VARCHAR(100) UNIQUE NOT NULL,
    summary TEXT,
    status VARCHAR(100),
    priority VARCHAR(50),
    type VARCHAR(100),
    creator VARCHAR(255),
    reporter VARCHAR(255),
    assignee VARCHAR(255),
    group_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    jira_url TEXT
);
```

PostgreSQL is the central persistent data store for the dashboard.

---

## 6. Excel → PostgreSQL

Current import flow:

```text
Excel
  |
  v
Pandas
  |
  v
Python import script
  |
  v
Psycopg
  |
  v
PostgreSQL
  |
  v
tickets table
```

The current 27 tickets were successfully imported.

### Current importer limitation

The importer currently performs normal inserts. Because `jira_key` is unique, rerunning the importer against existing rows can produce duplicate-key errors.

A future improvement is to use:

```sql
INSERT ... ON CONFLICT (jira_key) DO UPDATE
```

so existing Jira tickets are updated.

---

## 7. FastAPI Backend

FastAPI is the Python backend framework.

Start the application with:

```powershell
uvicorn main:app --reload
```

The local application is available at:

```text
http://127.0.0.1:8000
```

### API endpoints

```text
GET /
GET /tickets
GET /tickets/status
GET /tickets/priority
GET /tickets/type
GET /tickets/assignee
```

### Endpoint purpose

| Endpoint | Purpose |
|---|---|
| `/` | Application health/root response |
| `/tickets` | Returns ticket data |
| `/tickets/status` | Ticket counts by status |
| `/tickets/priority` | Ticket counts by priority |
| `/tickets/type` | Ticket counts by type |
| `/tickets/assignee` | Ticket counts by assignee |

---

## 8. Swagger / OpenAPI

FastAPI automatically provides Swagger UI:

```text
http://127.0.0.1:8000/docs
```

Swagger is used for:

- API testing
- Viewing endpoints
- Inspecting API responses
- Backend debugging

Swagger is **not** the manager-facing dashboard.

```text
Swagger → Developer/API testing
Dashboard → Manager UI
```

---

## 9. Custom Frontend

Grafana was initially considered for the visualization layer. The current DEV implementation instead uses a custom frontend because the required manager-specific interactions are easier to control directly.

Frontend:

```text
frontend/
├── index.html
├── style.css
└── script.js
```

### Responsibilities

`index.html`
- Dashboard structure
- KPI cards
- Filters
- Chart containers
- Ticket table

`style.css`
- Layout
- Cards
- Filters
- Tables
- Responsive styling
- Jira link styling

`script.js`
- Calls FastAPI APIs
- Loads ticket data
- Updates KPI cards
- Builds charts
- Handles filtering
- Handles chart selection
- Displays selected Jira IDs
- Opens Jira links

---

## 10. Dashboard Features

### KPI cards

The dashboard displays:

```text
Total Tickets
Open
Incoming
Accepted
```

### Filters

The dashboard supports filtering by fields such as:

```text
Search
Status
Type
Priority
Assignee
```

### Visual summaries

The dashboard includes:

```text
Ticket Status
Ticket Type
Priority
Assignee Workload
```

---

## 11. Interactive Chart Selection

Chart segments are clickable.

For example:

```text
Assignee Workload

FlashBlade Performance   20
Juan Quiroz               2
Ariel Jiang               1
...
```

When a segment is selected, the dashboard shows only the Jira IDs belonging to that selected value.

Example:

```text
Selected: FlashBlade Performance
20 tickets

IR-239910
IR-236080
IR-272195
IR-258456
...
```

The selected chart detail does **not** display the ticket summary, status, priority, or other ticket fields.

---

## 12. Jira ID Links

Each ticket contains a Jira URL from the original source data.

The Jira ID itself is clickable.

For example:

```text
IR-239910
```

Clicking the ID opens its corresponding Jira ticket in a new browser tab.

This applies to:

1. Jira IDs shown after selecting a chart segment
2. Jira IDs in the All Tickets table

No separate "View Jira" column is required.

---

## 13. All Tickets Section

The dashboard contains an All Tickets table with fields such as:

```text
Jira ID
Summary
Status
Priority
Type
Assignee
Updated
```

The Jira ID is a direct link to the corresponding Jira ticket.

Example:

```text
IR-239910
```

Clicking it opens the matching Jira page.

---

## 14. Current Project Structure

```text
manager-dashboard/
│
├── venv/
│
├── data/
│   └── FB Perf Backlog - Recommended Tickets.xlsx
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── read_excel.py
├── import_excel.py
├── test_db.py
├── main.py
├── requirements.txt
└── README.md
```

| File | Purpose |
|---|---|
| `read_excel.py` | Reads and verifies Excel data |
| `import_excel.py` | Imports Excel data into PostgreSQL |
| `test_db.py` | Tests PostgreSQL connectivity/data |
| `main.py` | FastAPI backend and API endpoints |
| `frontend/index.html` | Dashboard structure |
| `frontend/style.css` | Dashboard styling |
| `frontend/script.js` | Dashboard data, filters and interactions |
| `data/*.xlsx` | Current DEV data source |
| `requirements.txt` | Python dependencies |
| `README.md` | Project documentation |

---

## 15. Requirements

The project dependencies are:

```text
fastapi
uvicorn[standard]
psycopg[binary]
pandas
openpyxl
```

Install them with:

```powershell
python -m pip install -r requirements.txt
```

Recommended setup:

```powershell
python -m venv venv
.env\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Then:

```powershell
uvicorn main:app --reload
```

---

## 16. Local Access

Dashboard:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

`127.0.0.1` means the application is accessible from the local development machine.

---

## 17. Current Limitations

The source Excel file does not directly contain all fields from the original manager requirement.

For example:

```text
Current activity
Progress percentage
Blockers
Availability
Upcoming work
Manager comments
```

These values are therefore **not invented or estimated**.

The current dashboard uses information actually available in the source:

```text
Ticket
Status
Priority
Type
Assignee
Group
Created date
Updated date
Jira link
```

Also, `FlashBlade Performance` is an assignee value in the source data and should not automatically be interpreted as one individual person.

---

## 18. What Is Not Implemented Yet

### Jira API integration

Current:

```text
Excel → Python → PostgreSQL
```

Future:

```text
Jira API → Python → PostgreSQL
```

Jira API integration can later replace the Excel import.

### Production deployment

Not currently implemented.

Possible future work:

- Docker
- Kubernetes
- Authentication
- HTTPS
- Secrets management
- CI/CD
- Monitoring
- Automated Jira synchronization

### Real-time updates

The current Excel-based implementation is not real-time.

If the Excel file changes, PostgreSQL does not automatically update until the import process is run again.

---

## 19. Security Notes

Do not commit the real PostgreSQL password to source control.

Current local development may use:

```python
password="YOUR_PASSWORD"
```

A future improvement is to use an environment variable such as:

```text
POSTGRES_PASSWORD
```

instead of storing the password directly in Python.

---

## 20. Current Status

| Component | Status |
|---|---|
| Excel source | Completed |
| Pandas Excel reading | Completed |
| OpenPyXL | Completed |
| PostgreSQL installation | Completed |
| Database creation | Completed |
| `tickets` table | Completed |
| Excel → PostgreSQL import | Completed |
| Database verification | Completed |
| FastAPI installation | Completed |
| FastAPI application | Completed |
| `/tickets` API | Completed |
| Status API | Completed |
| Priority API | Completed |
| Type API | Completed |
| Assignee API | Completed |
| Swagger API testing | Completed |
| Custom HTML frontend | Completed |
| CSS styling | Completed |
| JavaScript API integration | Completed |
| KPI cards | Completed |
| Filters | Completed |
| Interactive charts | Completed |
| Jira ID links | Completed |
| All Tickets table | Completed |
| Jira API integration | Future |
| Production deployment | Future |

---

## 21. Complete DEV Architecture

```text
                 DEV MANAGER DASHBOARD

        ┌─────────────────────────────────┐
        │ Excel: Jira Backlog             │
        │ 27 tickets                      │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │ Python + Pandas                 │
        │ Read / process Excel            │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │ Psycopg                         │
        │ Python ↔ PostgreSQL             │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │ PostgreSQL                      │
        │ manager_dashboard               │
        │ tickets                         │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │ FastAPI                         │
        │ Python REST API                 │
        └───────────────┬─────────────────┘
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
      ┌──────────────┐      ┌──────────────────┐
      │ Swagger      │      │ HTML/CSS/JS      │
      │ API testing  │      │ Manager UI       │
      └──────────────┘      └──────────────────┘
```

---

## 22. Recommended Next Improvements

The core DEV dashboard is functional.

Possible next improvements:

1. Improve dashboard visual design
2. Improve chart selection and filtering behavior
3. Add loading/error/empty states
4. Move database credentials to environment variables
5. Change Excel import to an upsert process
6. Add automated data refresh
7. Evaluate Jira API integration
8. Plan production deployment

The current implementation should remain focused on validating the DEV dashboard before moving to Jira API integration or production deployment.
