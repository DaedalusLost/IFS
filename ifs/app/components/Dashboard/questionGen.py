#!/usr/bin/python
import MySQLdb, sys
import csv


class Database:

    host = 'localhost'
    user = 'USER'
    password = 'PASSWORD'
    db = 'IFS'

    def __init__(self):
        self.connection = MySQLdb.connect(self.host, self.user, self.password, self.db)
        self.cursor = self.connection.cursor()

    def insert(self, query):
        try:
            self.cursor.execute(query)
            self.connection.commit()
        except:
            self.connection.rollback()

    def __del__(self):
        self.connection.close()


if __name__ == "__main__":

    db = Database()

    # query = "delete from users where id > 4"
    # db.insert(query)

    reader = csv.reader(open("questions.csv", "rb"))
    for r in reader:
        print r



