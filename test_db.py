import psycopg


connection = psycopg.connect(
    host="localhost",
    port=5432,
    dbname="manager_dashboard",
    user="postgres",
    password="12345"
)

print("Connected to PostgreSQL successfully!")


cursor = connection.cursor()

cursor.execute("SELECT * FROM tickets;")

rows = cursor.fetchall()

print("Tickets found:")

for row in rows:
    print(row)


cursor.close()
connection.close()