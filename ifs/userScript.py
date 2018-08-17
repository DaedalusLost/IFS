#!/usr/bin/python
import MySQLdb, sys


class Database:

	host = 'localhost'
	user = 'nick'
	password = 'password123'
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

	query = "delete from users where id > 1"
	db.insert(query)

	query = "delete from user_registration where id > 1"
	db.insert(query)

	query = "alter table users AUTO_INCREMENT = 1"

	with open("users.py", "wa") as file:
		file.write("USERS = [")
		for k in range(2,502):

			name = "test" + str(k) + "@uoguelph.ca"
			password = "$2a$10$yO7sPc1aOdPGcXHLq3PbDOyQK/m1FV3IV3pKrcyAPOGQByvuoF8PK"
			opted = 1
			# print("(%s, %s, %d)", (name, password, opted))

			query= "insert into users(id, username, password, optedIn) values (" + str(k) + ", \"" + name + "\", \"" + password + "\", 1);"
			db.insert(query)

			query = "insert into user_registration (id, userId, isRegistered, completedSetup) values (" + str(k) + ", " + str(k) + ", 1, 1);"
			db.insert(query)

			query = "insert into student (id, userId, name) values (" + str(k) + ", " + str(k) + ", \"Nick Domenichini\");"
			db.insert(query)

			file.write("(\"" + name + "\", \"password123\"),\n")
		file.write("]\n")







