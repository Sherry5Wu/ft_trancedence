import sqlite3

# Yhdistä tietokantaan
conn = sqlite3.connect('./services/auth-service/data/auth.db')
cursor = conn.cursor()

# Hae kaikki taulut
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Tulosta taulut
print("Taulut:", tables)

# Jos 'users' on olemassa, tarkastele sen sisältöä
if ('Users',) in tables:
    cursor.execute("SELECT * FROM users;")
    users = cursor.fetchall()
    print("Users:", users)

# Sulje yhteys
conn.close()

