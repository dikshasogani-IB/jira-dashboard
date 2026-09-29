import pandas as pd


file_path = "data/FB Perf Backlog - Recommended Tickets.xlsx"

df = pd.read_excel(file_path)

print("Excel loaded successfully!")
print("Number of rows:", len(df))

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())
