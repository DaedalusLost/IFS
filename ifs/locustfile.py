from locust import Locust, TaskSet, task, HttpLocust
from users import *
import time
import logging, sys



class feedback(TaskSet):

	@task(10)
	def feedPage(self):
		response = self.client.get("/feedback")

		# print(response.content)

	@task(5)
	def stop(self):
		self.interrupt()





class toolPage(TaskSet):
	# tasks = {feedback: 2}


	def on_start(self):
		limit = 500 - 10

		if len(USERS) > limit:
			username, password = USERS.pop()
			response = self.client.post("/login", data={"username": username, "password": password})
			# self.client.get("/login-redirect")
			print(response.content)


	@task(10)
	def toolUpload(self):
		with open('a4.c', 'rb') as file:
			current_milli_time = lambda: int(round(time.time() * 1000))

			test = self.client.post("/tool_upload", files={'files': file},
			                        data={ 'tool-./tools/programmingTools/c_tools/gccParser.py': 'GCC Diagnostics',
										  'enabled-GCC Diagnostics': 'on',
										  'opt-gccLanguageStd': 'c99',
										  'opt-gccCompilerFlags': '',
										  'tool-./tools/programmingTools/c_tools/clangParser.py': 'Clang Diagnostics',
										  'enabled-Clang Diagnostics': 'on',
										  'opt-clangLanguageStd': 'c99',
										  'opt-clangCompilerFlags': '',
										  'tool-./tools/programmingTools/c_tools/cppcheckParser.py': 'Code Quality Checker',
										  'opt-cppCheckErrorLevel': 'all',
										  'opt-cppCheckLanguageStd': 'c99',
										  'tool-./tools/programmingTools/c_tools/includecheck.py': '#Include Path Checker',
										  'tool-./tools/programmingTools/c_stats/stats.py': 'Statistics',
										  'tool-./tools/programmingTools/python_tools/pythonParser.py': 'Python Formatting',
										  'opt-pythonStandard': 'python3',
										  'time': current_milli_time(),
										  'assignId': '0' })



class MyLocust(HttpLocust):
    task_set = toolPage
    min_wait = 10000
    max_wait = 30000
