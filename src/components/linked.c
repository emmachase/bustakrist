#include <stdio.h>
#include <stdlib.h>

struct LinkedList {
    void *data;
    struct LinkedList *next; // NULL, 
};

struct LinkedList *list_prepend(struct LinkedList *list, void *data) {
    struct LinkedList *new = malloc(sizeof (struct LinkedList));
    new->data = data;
    new->next = list;

    return new;
}

void free_list(struct LinkedList *list) {
    struct LinkedList *next = list->next;
    free(list);

    if (next) free_list(next);
}

int main() {
    int x = 4;

    x += 1;
    int *px = &x;

    struct LinkedList *myList = list_prepend(NULL, 0);
    myList = list_prepend(myList, 1);
    myList = list_prepend(myList, 2);
    myList = list_prepend(myList, 3);
    myList = list_prepend(myList, 4);

    for (struct LinkedList *cur = myList; cur; cur = cur->next) {
        printf("Next value: %d\n", cur->data);
    }

    free_list(myList);
}
