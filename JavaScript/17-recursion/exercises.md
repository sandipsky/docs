# 17 Recursion: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Copy the starting data from the exercise into your file, then write your code below it.
- Run each one with `node ex1.js`.
- If you get `RangeError: Maximum call stack size exceeded`, don't panic. Check your base case, and check that every call gets closer to it.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Can pyramid

A supermarket stacks cans of beans in a pyramid. The bottom row has a certain number of cans, each row above has one can fewer, and the top row has just 1.

```
      []
     [][]
    [][][]
   [][][][]     ← 4 rows: 1 + 2 + 3 + 4 = 10 cans
```

1. Write a recursive function `cansInPyramid(rows)` that returns how many cans a pyramid with that many rows needs. A pyramid with 0 rows needs 0 cans.
2. **On paper first**, write the trace for `cansInPyramid(4)` in the same style as the factorial trace in the notes (`= 4 + cansInPyramid(3)` and so on).
3. Print these results:

```
cansInPyramid(0) = 0
cansInPyramid(1) = 1
cansInPyramid(4) = 10
cansInPyramid(10) = 55
cansInPyramid(100) = 5050
```

**Rule:** no loops inside `cansInPyramid`. (A loop to print the five results is fine.)

<details>
<summary>Hint 1</summary>

What's the smallest pyramid you can answer without thinking? That's your base case.

</details>

<details>
<summary>Hint 2</summary>

A pyramid with 4 rows is the bottom row of 4 cans, plus a smaller pyramid with 3 rows sitting on top of it.

</details>

---

## Exercise 2 (Easy): Backwards words

A word game needs to reverse words and spot **palindromes**: words that read the same backwards, like "level".

1. Write a recursive function `reverse(word)` that returns the word backwards.
2. Write `isPalindrome(word)`, which uses `reverse` and ignores capital letters.
3. Print:

```
"stressed" reversed is "desserts"
"drawer" reversed is "reward"
"a" reversed is "a"
"" reversed is ""
Is "Racecar" a palindrome? true
Is "Rocket" a palindrome? false
```

**Rule:** don't use the `split("").reverse().join("")` trick from chapter 10. The point is to practice recursion.

<details>
<summary>Hint 1</summary>

Which words are already their own reverse, without doing anything? Think about very short ones. That's your base case.

</details>

<details>
<summary>Hint 2</summary>

`word[0]` is the first letter, and `word.slice(1)` is everything after it (chapter 06). The reverse of "cat" is the reverse of "at", followed by "c".

</details>

---

## Exercise 3 (Medium): Comment thread

A recipe website lets people reply to comments, and reply to replies, as deep as they like.

```js
const comments = [
  {
    author: "Ana",
    text: "Great recipe!",
    replies: [
      { author: "Ben", text: "Agreed, making it tonight.", replies: [] },
      {
        author: "Cleo",
        text: "Did you use fresh basil?",
        replies: [{ author: "Ana", text: "Yes, from my garden.", replies: [] }],
      },
    ],
  },
  { author: "Dev", text: "A bit too salty for me.", replies: [] },
];
```

1. Write `printThread(commentList, depth = 0)`, which prints every comment in the list, with each reply indented 2 more spaces than the comment it answers.
2. Write `countComments(commentList)`, which returns how many comments there are in total, replies included.

Expected output:

```
Ana: Great recipe!
  Ben: Agreed, making it tonight.
  Cleo: Did you use fresh basil?
    Ana: Yes, from my garden.
Dev: A bit too salty for me.
Total comments: 5
```

<details>
<summary>Hint 1</summary>

This works just like `printTree` in the notes, except that your function receives a whole *list* of comments. Loop over the list: print each comment, then hand its `replies` to `printThread`, one level deeper.

</details>

<details>
<summary>Hint 2</summary>

Where's the base case? Look at the comments with `replies: []`. What does a `for...of` loop do with an empty array?

</details>

<details>
<summary>Hint 3</summary>

For `countComments`, each comment counts as 1, plus however many comments are in its replies.

</details>

---

## Exercise 4 (Medium): Boxes inside boxes

A gift shop packs surprise boxes. A box can hold gifts (each gift is written as its value in dollars) and smaller boxes, which can hold more gifts and even smaller boxes, like nesting dolls.

```js
const giftBox = [25, [10, 5], [[40], 15], []];
```

Here, the big box holds a $25 gift, a box with $10 and $5 gifts, a box that holds another box (with a $40 gift) plus a $15 gift, and one empty box.

Write three recursive functions:

1. `totalValue(box)` returns the value of all the gifts, at any depth.
2. `countGifts(box)` returns how many gifts there are, at any depth.
3. `deepestLevel(box)` returns how many levels of boxes there are. The big box is level 1, a box inside it is level 2, and so on. A box with no boxes inside it (even an empty one) is level 1.

Expected output:

```
Total value: $95
Gifts: 5
Deepest level: 3
```

**Rule:** don't use `flat`. Use recursion and `Array.isArray`.

<details>
<summary>Hint 1</summary>

All three functions have the same shape as `flatten` in the notes: loop over the items, and treat a box (an array) differently from a gift (a number).

</details>

<details>
<summary>Hint 2</summary>

In `totalValue`, a gift adds its own value, and a box adds the total value of everything inside it. What does an empty box add up to?

</details>

<details>
<summary>Hint 3</summary>

For `deepestLevel`, keep track of the deepest level you've found *inside* this box, starting at 0. For every item that's a box, ask `deepestLevel` about it, and keep the bigger number with `Math.max`. This box's level is 1 more than the deepest one inside it.

</details>

---

## Exercise 5 (Challenge): Shop menu and breadcrumbs

An online shop organizes its products into categories, which can hold smaller categories. Only the smallest categories (the ones with no `children`) hold products directly.

```js
const menu = {
  name: "All products",
  children: [
    {
      name: "Electronics",
      children: [
        { name: "Phones", products: 12 },
        {
          name: "Computers",
          children: [
            { name: "Laptops", products: 8 },
            { name: "Desktops", products: 5 },
          ],
        },
      ],
    },
    {
      name: "Home",
      children: [
        { name: "Kitchen", products: 20 },
        { name: "Garden", products: 7 },
      ],
    },
  ],
};
```

Write three recursive functions:

1. `countProducts(category)` returns how many products a category holds, including everything in its subcategories.
2. `printMenu(category, depth = 0)` prints each category, indented by level, with its product count in brackets.
3. `findPath(category, target)` returns the list of category names from the top down to the one called `target`, like `[ 'All products', 'Home', 'Garden' ]`. If there's no category with that name, it returns `null`.

Then print the menu, followed by the **breadcrumbs** (the "you are here" trail that shops show at the top of a page) for `"Laptops"`, `"Garden"`, and `"Toys"`:

```
All products (52)
  Electronics (25)
    Phones (12)
    Computers (13)
      Laptops (8)
      Desktops (5)
  Home (27)
    Kitchen (20)
    Garden (7)
All products > Electronics > Computers > Laptops
All products > Home > Garden
Toys: not found
```

<details>
<summary>Hint 1</summary>

`countProducts` works like `countFiles` in the notes. A category without `children` is the base case: its answer is its own `products` number.

</details>

<details>
<summary>Hint 2</summary>

`printMenu` is `printTree` from the notes, plus a call to `countProducts` for each line.

</details>

<details>
<summary>Hint 3</summary>

`findPath` is the tricky one. Base case: if this category's name is the target, the path is an array holding just this name. Otherwise, try each child. If a child comes back with a path, put this category's name in front of that path (spread from chapter 15 helps) and return it. If no child finds it, return `null`.

</details>

<details>
<summary>Hint 4</summary>

Test `findPath` on its own before the breadcrumbs: `console.log(findPath(menu, "Garden"))` should print `[ 'All products', 'Home', 'Garden' ]`. Then `join(" > ")` from chapter 10 turns a path into breadcrumbs.

</details>

---

## Before you move on

When your recursion ran too deep, the whole program crashed with a `RangeError` and stopped. In a real app, you don't want one problem to bring everything down.

[Chapter 18](../18-error-handling/notes.md) shows you how to catch errors, deal with them, and even throw your own.
