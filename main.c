#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef enum {
  None = 0u,
  L,
  S,
  M,
} OpType;

char *opType_to_string(OpType op_type);

typedef struct {
  OpType op_type;
  uint64_t address;
} Input;

typedef struct {
  bool valid;
  uint64_t tag;
} CacheLine;

typedef struct {
  uint8_t s;
  uint8_t E;
  uint8_t b;
  u_int8_t hits;
  u_int8_t misses;
  u_int8_t evictions;
  CacheLine **sets;
} Cache;

void makeCache(uint8_t s, uint8_t E, uint8_t b, Cache *c) {
  uint8_t num_sets = 1 << s;
  c->s = s;
  c->E = E;
  c->b = b;

  // allocate memomry for the sets array
  c->sets = (CacheLine **)malloc(num_sets * sizeof(CacheLine *));
  if (c->sets == NULL) {
    perror("Memory allocation for sets failed!\n");
    return;
  }
  // allocate memory of each set
  for (uint8_t i = 0; i < num_sets; i++) {
    c->sets[i] = (CacheLine *)malloc(E * sizeof(CacheLine));
    if (c->sets[i] == NULL) {
      fprintf(stderr, "Memory allocation for sets %d failed!\n", i);
      return;
    }

    // initialise each CacheLine in the current set
    for (uint8_t j = 0; j < E; j++) {
      c->sets[i][j].valid = false;
      c->sets[i][j].tag = 0;
    }
  }

  c->hits = 0;
  c->misses = 0;
  c->evictions = 0;
}

void cache_delete(Cache *c) {
  uint8_t num_sets = 1 << c->s;

  if (c->sets == NULL) {
    perror("Memory allocation for sets failed!\n");
    return;
  }
  // allocate memory of each set
  for (uint8_t i = 0; i < num_sets; i++) {
    free(c->sets[i]);
    if (c->sets[i] == NULL) {
      fprintf(stderr, "Memory allocation for sets %d failed!\n", i);
      return;
    }
  }

  free(c->sets);
}

void printCache(uint8_t s, uint8_t E, Cache *c) {
  uint8_t num_sets = 1 << s;

  if (c->sets == NULL) {
    fprintf(stderr, "sets is null\n");
    return;
  }

  for (uint8_t i = 0; i < num_sets; i++) {
    printf("set[%u]\n", i);

    for (uint8_t j = 0; j < E; j++) {
      CacheLine *set = c->sets[i];
      if (set == NULL) {
        printf("set %u is null\n", i);
        continue;
      }
      CacheLine line = set[j];
      printf("  %u %llu\n", line.valid, line.tag);
    }
  }
}

void access(Cache *c, uint64_t address) {

  uint64_t setIndex = (address >> c->b) & ((1 << c->s) - 1);
  uint64_t tag = (address) >> (c->s + c->b);
  CacheLine *set = c->sets[setIndex];

  for (uint8_t i = 0; i < c->E; i++) {
    CacheLine line = set[i];
    if (line.valid == true & line.tag == tag) {
      // it's a hit
      c->hits++;
      return;
    }
  }

  // it's a miss or evict
  int8_t empty_line_index = -1;

  for (uint8_t i = 0; i < c->E && set[i].valid == false; i++)
    empty_line_index = i;

  c->misses++;

  if (empty_line_index != -1) {
    // it's a miss
    c->sets[setIndex][empty_line_index].valid = true;
    c->sets[setIndex][empty_line_index].tag = tag;
  } else {
    // evict
    c->sets[setIndex][0].valid = true;
    c->sets[setIndex][0].tag = tag;
    c->evictions++;
  }
}

uint8_t parse(char *line, char *instruction, uint64_t *address) {

  if (line[0] == 'I' || line[0] == '\n')
    return 0;

  // skip the first whitespace
  uint64_t char_index = 1;
  *instruction = line[char_index];

  char digits[100];
  // skip the second whitespace and start consuming the address until
  // we encounter a comma
  uint8_t characters_to_skip = 3;
  char_index = characters_to_skip;
  while ((line[char_index] != ',')) {
    digits[char_index - characters_to_skip] = line[char_index];
    char_index++;
  }

  digits[char_index] = '\0';
  char *endptr;
  // Convert the string to an integer with base 16 (hexadecimal)
  *address = strtol(digits, &endptr, 16);

  // Check if the conversion was successful
  if (*endptr == '\0') {
    return 0;
  } else {
    printf("Invalid hexadecimal input: %s\n", digits);
    return 1;
  }
}

int main(void) {
  Cache c;
  uint8_t s = 4;
  uint8_t E = 1;
  uint8_t b = 4;
  makeCache(s, E, b, &c);

  FILE *fd = fopen("traces/yi.trace", "r");
  char line[1000];

  while ((fgets(line, sizeof(line), fd)) != NULL) {
    char instruction;
    uint64_t address;
    uint8_t status = parse(line, &instruction, &address);
    if (status > 0) {
      return 1;
    }

    access(&c, address);
    if (instruction == 'M') {
      access(&c, address);
    }
    printf("%c %llu\n", instruction, address);
  }

  // printCache(s, E, &c);
  printf("hits: %u misses: %u evictions: %u\n", c.hits, c.misses, c.evictions);

  cache_delete(&c);
  return 0;
}

char *opType_to_string(OpType op_type) {
  if (op_type == 1) {
    return "L";
  } else if (op_type == 2) {
    return "S";
  } else if (op_type == 3) {
    return "M";
  } else {
    return "None";
  }
}
