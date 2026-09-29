import pandas as pd
import psycopg


# --------------------------------
# 1. Read Excel
# --------------------------------

file_path = "data/FB Perf Backlog - Recommended Tickets.xlsx"

df = pd.read_excel(file_path)

print("Excel loaded successfully!")
print("Number of tickets:", len(df))


# --------------------------------
# 2. Connect to PostgreSQL
# --------------------------------

connection = psycopg.connect(
    host="localhost",
    port=5432,
    dbname="manager_dashboard",
    user="postgres",
    password="12345"
)

print("Connected to PostgreSQL successfully!")


# --------------------------------
# 3. Insert Excel data
# --------------------------------

cursor = connection.cursor()

for _, row in df.iterrows():

    cursor.execute(
        """
        INSERT INTO tickets (
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
        )
        VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        )
        """,
        (
            row["Key"],
            row["Summary"],
            row["Status"],
            row["Priority"],
            row["Type"],
            row["Creator"],
            row["Reporter"],
            row["Assignee"],
            row["Group"],
            row["Created"],
            row["Updated"],
            row["Link"]
        )
    )


# --------------------------------
# 4. Save changes
# --------------------------------

connection.commit()

print("Excel data inserted successfully!")


# --------------------------------
# 5. Close connection
# --------------------------------

cursor.close()
connection.close()

print("Database connection closed.")