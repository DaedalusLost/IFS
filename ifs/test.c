#include <stdio.h>
#include <omp.h>
#include <string.h>
#include <unistd.h>


char * toolName(char * path);


int main(int argc, char * argv[])
{
	char cwd[1024];

    char commandArray[argc-1][255];

    for(int i = 1; i < argc; i++)
    {
    	strcpy(commandArray[i-1], argv[i]);
    	strcat(commandArray[i-1], "\0");

    }

	char strArr[argc-1][1000];


	#pragma omp parallel for
	for(int k = 0; k < argc-1; k++)
	{
		char tool[255];
		char str[255] = {'\0'};
		char temp[1000] = {'\0'};
		char fileName[255] = "feedback_";

		strcpy(tool, toolName(commandArray[k]));

		strcat(fileName, tool);
		strcat(fileName, "_unzipped");

		printf("tool: %s\n", fileName);


		FILE * fp, * submitFile;

		fp = popen(commandArray[k], "r");

		while(fgets(str, sizeof(str)-1, fp) != NULL)
		{
			strcat(temp, str);
		}

		pclose(fp);

		strcpy(strArr[k], temp);

	}

	for(int i = 0; i < argc-1; i++)
	{
		printf("%s\n", strArr[i]);
	}


}

char * toolName(char * path)
{
	static char str[255];
	int i = 0;
	int min = 0;
	int store[10];
	int P = 0;
	int count = 0;
	int index = 0;

	while(path[i])
	{
		if(path[i] == '/')
		{
			store[count++] = i;
		}
		else if(path[i] == 'P')
		{
			P = i;
		}
		i++;
	}

	for(int k = 0; k < count; k++)
	{
		if(store[k] < P)
		{
			index++;
		}
	}

	count = 0;
	for(int k = store[index-1]+1; k < P; k++)
	{
		str[count++] = path[k];
	}
	str[count] = '\0';


	return str;
}
