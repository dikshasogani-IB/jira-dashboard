Manager Jira Dashboard
Overview
The Manager Jira Dashboard is a local web application that helps managers review Jira ticket information in one place. It provides summary cards, charts, filters, ticket details, and links to Jira issues.
The application uses:
- Python for backend logic
- FastAPI to expose API endpoints
- PostgreSQL to store ticket data
- HTML, CSS, and JavaScript for the dashboard interface
Prerequisites
Install the following before starting:
- Python 3.11 or a compatible supported Python version
- PostgreSQL
- Visual Studio Code (recommended)
Initial Setup
1. Open the project
Open the project folder in VS Code, then open Terminal → New Terminal.
2. Create and activate a virtual environment
On Windows PowerShell, run:
python -m venv venv
.Venv\Scripts\Activate.ps1
If PowerShell blocks activation, follow your organization's approved execution-policy guidance or activate the environment using the VS Code Python environment selector.
3. Install dependencies
Make sure requirements.txt is present in the project root, then run:
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
4. Configure PostgreSQL
Create or use a PostgreSQL database for the application. The default configuration expects:
- Host: localhost
- Port: 5432
- Database: manager_dashboard
- User: postgres
Create a local .env file in the same directory as main.py and set the database values:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manager_dashboard
DB_USER=postgres
DB_PASSWORD=replace_with_your_postgresql_password

Replace the password placeholder with your local PostgreSQL password. Keep .env private and do not commit it to GitHub. The application loads the database configuration from this file.
The database must contain the tickets table and the fields used by the API. If the database or table has not been initialized, set it up using your project's approved database initialization process before starting the application.
Start the Application


From the project root, with the virtual environment activated, run:
python -m uvicorn main:app --reload


The --reload option restarts the development server when code changes are saved.
Open these URLs in your browser:
- Dashboard: http://127.0.0.1:8000/
- Swagger API documentation: http://127.0.0.1:8000/docs
To stop the server, press Ctrl+C in the terminal.
API Endpoints
Method	Endpoint	Purpose
GET	/	Opens the dashboard page
GET	/tickets	Returns ticket records
GET	/tickets/status	Returns ticket counts grouped by status
GET	/tickets/priority	Returns ticket counts grouped by priority
GET	/tickets/type	Returns ticket counts grouped by type
GET	/tickets/assignee	Returns ticket counts grouped by assignee
GET	/tickets/export	Downloads ticket data as an Excel workbook


Use Swagger at http://127.0.0.1:8000/docs to inspect endpoints and test API responses.
Code Summary
manager-dashboard/
├── main.py             # FastAPI application and database-backed API endpoints
├── requirements.txt    # Python package dependencies
├── .env                # Local database credentials; do not commit
├── .gitignore          # Files Git should ignore
└── frontend/
    ├── index.html      # Dashboard page structure
    ├── style.css       # Dashboard appearance and layout
    └── script.js       # API calls, charts, filters, and UI interactions
- main.py connects to PostgreSQL and provides the dashboard and ticket APIs.
- requirements.txt lists the Python packages needed to run the application.
- frontend/index.html defines the dashboard structure.
- frontend/style.css controls the visual styling and responsive layout.
- frontend/script.js retrieves API data and updates dashboard cards, charts, filters, and ticket links.
- .env stores local configuration such as the database password. It should remain on the local machine and must not be committed.
Security Notes
- Never commit .env, database passwords, API tokens, or other credentials.
- Confirm .env is listed in .gitignore before pushing changes.
- If a credential has already been committed or shared, rotate it; deleting it from the latest file alone does not remove it from Git history.
Scope
This project currently provides a development dashboard backed by PostgreSQL. Jira API synchronization and production deployment are not included in the current scope.