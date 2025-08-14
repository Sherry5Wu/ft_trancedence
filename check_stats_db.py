import sqlite3

# Yhdistä tietokantaan
conn = sqlite3.connect('./services/stats-service/data/stats.db')
cursor = conn.cursor()

# Hae kaikki taulut
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Tulosta taulut
print("Taulut:", tables)

# Jos 'users' on olemassa, tarkastele sen sisältöä
if ('rivals',) in tables:
    cursor.execute("SELECT * FROM rivals;")
    rivals = cursor.fetchall()
    print("Rivals:", rivals)

# Sulje yhteys
conn.close()

