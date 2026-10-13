from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
import psycopg
from io import BytesIO
from openpyxl import Workbook
from dotenv import load_dotenv
import os 

app = FastAPI()
load_dotenv()

# Serve frontend files
# Serve frontend files
app.mount("/static", StaticFiles(directory="frontend"), name="static")


# Database connection: keep credentials in the local .env file.
def get_connection():
    password = os.getenv("DB_PASSWORD")
    if not password:
        raise RuntimeError(
            "DB_PASSWORD is not set. Add it to your local .env file. "
            "Do not commit .env to Git."
        )

    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "manager_dashboard"),
        user=os.getenv("DB_USER", "postgres"),
        password=password,
    )

# Home page - open the dashboard
@app.get("/")
def home():
    return FileResponse("frontend/index.html")


# Get all tickets
@app.get("/tickets")
def get_tickets():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            jira_key,
            summary,
            status,
            priority,
            type,
            creator,
            reporter,
            assignee,
            group_name,
            created_at,
            updated_at,
            jira_url
        FROM tickets
        ORDER BY updated_at DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    tickets = []

    for row in rows:

        tickets.append({
            "jira_key": row[0],
            "summary": row[1],
            "status": row[2],
            "priority": row[3],
            "type": row[4],
            "creator": row[5],
            "reporter": row[6],
            "assignee": row[7],
            "group": row[8],
            "created_at": row[9],
            "updated_at": row[10],
            "jira_url": row[11]
        })

    return {
        "total": len(tickets),
        "tickets": tickets
    }


# Get ticket count by status
@app.get("/tickets/status")
def get_ticket_status():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            status,
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY status
        ORDER BY ticket_count DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    result = []

    for row in rows:

        result.append({
            "status": row[0],
            "count": row[1]
        })

    return result


# Get ticket count by priority
@app.get("/tickets/priority")
def get_ticket_priority():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            priority,
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY priority
        ORDER BY ticket_count DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    result = []

    for row in rows:

        result.append({
            "priority": row[0],
            "count": row[1]
        })

    return result


# Get ticket count by type
@app.get("/tickets/type")
def get_ticket_type():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            type,
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY type
        ORDER BY ticket_count DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    result = []

    for row in rows:

        result.append({
            "type": row[0],
            "count": row[1]
        })

    return result


# Get ticket count by assignee
@app.get("/tickets/assignee")
def get_ticket_assignee():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            assignee,
            COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY assignee
        ORDER BY ticket_count DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    result = []

    for row in rows:

        result.append({
            "assignee": row[0],
            "count": row[1]
        })

    return result

# Download all tickets as an Excel file
@app.get("/tickets/export")
def export_tickets_excel():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            jira_key,
            summary,
            status,
            priority,
            type,
            creator,
            reporter,
            assignee,
            group_name,
            created_at,
            updated_at,
            jira_url
        FROM tickets
        ORDER BY updated_at DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Tickets"

    headers = [
        "Jira ID",
        "Summary",
        "Status",
        "Priority",
        "Type",
        "Creator",
        "Reporter",
        "Assignee",
        "Group",
        "Created",
        "Updated",
        "Jira URL"
    ]

    worksheet.append(headers)

    for row in rows:
        worksheet.append(list(row))

    # Make the Excel sheet easier to read.
    worksheet.freeze_panes = "A2"
    worksheet.auto_filter.ref = worksheet.dimensions

    for column in worksheet.columns:
        max_length = 0
        column_letter = column[0].column_letter

        for cell in column:
            value = "" if cell.value is None else str(cell.value)
            max_length = max(max_length, len(value))

        worksheet.column_dimensions[column_letter].width = min(max(max_length + 2, 12), 50)

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=manager_dashboard_tickets.xlsx"
        }
    )
