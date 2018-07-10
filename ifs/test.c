#include <stdio.h>
#include <omp.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>


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

	char * strArr[argc-1];

	#pragma omp parallel
	{
		for(int k = 0; k < argc-1; k++)
		{
			char tool[255];
			char * str = NULL;
			char line[100];
			char fileName[255] = "feedback_";
			int length;
			char * temp = NULL;
			int size = 1, newSize = 255, index = 0;

			#pragma omp critical
			strcpy(tool, toolName(commandArray[k]));

			strcat(fileName, tool);
			strcat(fileName, "_unzipped");

			FILE * fp, * submitFile;

			fp = popen(commandArray[k], "r");

			#pragma omp critical
			while (fgets(line, sizeof(line), fp) != NULL) 
			{
			    length = strlen(line);
			    temp = realloc(str, size + length);  // allocate room for the buf that gets appended
			    if (temp == NULL) {
			      // allocation error
			    } else {
			      str = temp;
			    }
			    strcpy(str + size - 1, line);     // append buffer to str
			    size += length; 
		  	}		

			pclose(fp);


			submitFile = fopen(fileName, "wa");
			fprintf(submitFile, "%s", str);
			fclose(submitFile);

			// strArr[k] = malloc(sizeof(char) * strlen(line)+1);

		}
	}

	return 0;


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
