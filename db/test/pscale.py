from dotenv import load_dotenv

load_dotenv()

import os
import MySQLdb
import csv

connection = MySQLdb.connect(
  host= os.getenv("HOST"),
  user=os.getenv("USERNAME"),
  passwd= os.getenv("PASSWORD"),
  db= os.getenv("DATABASE"),
  ssl_mode = "VERIFY_IDENTITY",
  ssl      = {
    "ca": "/etc/ssl/cert.pem"
  }
)

def insert_from_csv(csv_path: str):
    with open(csv_path, 'r', encoding='utf8') as f:
        reader = csv.reader(f)
        header = next(reader)
        idx_year = header.index("year")
        idx_game = header.index('game')
        for line in reader:
            year = int(line[idx_year])
            game = int(line[idx_game])
            cursor.execute(
                f"INSERT INTO result_table (year, game) VALUES ({year}, {game}) "
                )


cursor = connection.cursor()
# insert_from_csv("../csv_new/data2016_processed.csv")
# cursor.execute("select * from users;")
# cursor.execute("INSERT INTO users VALUES(2, 'a@com', 'Asano', 'Ryutaro')")
cursor.execute("select * from users;")
rows = cursor.fetchall()
for row in rows:
  print (row)
connection.commit()
connection.close()


