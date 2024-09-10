CC=clang
CFLAGS=-g -Wall -Wextra --pedantic -std=c17

main: main.c
	$(CC) $(CFLAGS) main.c -o bin/main

clean:
	rm -rf bin
	mkdir bin

