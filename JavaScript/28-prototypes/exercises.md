# 28 Prototypes: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js`.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Default settings

A note-taking app has default settings. Each user can change some of them, and anything they haven't changed should fall back to the defaults automatically.

1. Create `defaultSettings` with `theme: "light"`, `fontSize: 16` and `language: "English"`.
2. Create `mySettings` with `Object.create`, so that its prototype is `defaultSettings`.
3. Give `mySettings` its own `theme` of `"dark"`. Don't copy the other settings.

Then run this test code:

```js
console.log(mySettings.theme);
console.log(mySettings.fontSize);
console.log(Object.keys(mySettings));
console.log(Object.hasOwn(mySettings, "fontSize"));
console.log("fontSize" in mySettings);

defaultSettings.fontSize = 18; // the app's defaults get an update
console.log(mySettings.fontSize);
console.log(defaultSettings.theme);
```

Expected output:

```
dark
16
[ 'theme' ]
false
true
18
light
```

Then answer these in a comment:

- Why does `mySettings.fontSize` change to `18`, even though you never touched `mySettings`?
- Why is `defaultSettings.theme` still `"light"`?

<details>
<summary>Hint</summary>

Reading a property walks up the chain. Setting a property creates an own property on the object you set it on. Look at "Reading walks the chain, writing doesn't" in the notes.

</details>

---

## Exercise 2 (Easy): Plant care, the old way

You've found some older code for a plant-care app, written with a constructor function. Recreate it:

1. Write a constructor function `Plant(name, waterEveryDays)` that stores both values.
2. Add two methods to `Plant.prototype`:
   - `describe()` returns a line like `Fern: water every 3 days`.
   - `needsWater(daysSinceWatered)` returns `true` if it has been at least `waterEveryDays` days.

Test it with this code:

```js
const fern = new Plant("Fern", 3);
const cactus = new Plant("Cactus", 14);

console.log(fern.describe());
console.log(cactus.describe());
console.log(fern.needsWater(4));
console.log(cactus.needsWater(4));
console.log(fern.describe === cactus.describe);
console.log(Object.hasOwn(fern, "describe"));
```

Expected output:

```
Fern: water every 3 days
Cactus: water every 14 days
true
false
true
false
```

3. Now, **after** that test code, add a third method, `rename(newName)`, to `Plant.prototype`. Then call `cactus.rename("Prickly Pete")` and print `cactus.describe()`. You should see:

```
Prickly Pete: water every 14 days
```

The cactus was created *before* `rename` existed. Why can it still use it? Answer in a comment.

<details>
<summary>Hint 1</summary>

Methods on a prototype are written as `Plant.prototype.describe = function () { ... };`. Use `function`, not an arrow function. (Common mistake 3 in the notes shows why.)

</details>

<details>
<summary>Hint 2</summary>

For step 3, remember that the link to the prototype is live, not a copy.

</details>

---

## Exercise 3 (Medium): Modernize a recipe app

A cooking app has this older code for scaling recipes up or down. Copy it into `ex3.js` and run it:

```js
function Recipe(name, servings) {
  this.name = name;
  this.servings = servings;
  this.ingredients = [];
}

Recipe.prototype.addIngredient = function (item, grams) {
  this.ingredients.push({ item, grams });
};

Recipe.prototype.scaleTo = function (newServings) {
  const factor = newServings / this.servings;
  return this.ingredients.map((ingredient) => `${ingredient.item}: ${ingredient.grams * factor}g`);
};

const pancakes = new Recipe("Pancakes", 4);
pancakes.addIngredient("Flour", 200);
pancakes.addIngredient("Milk", 300);
pancakes.addIngredient("Sugar", 20);

console.log(pancakes.scaleTo(2));
console.log(pancakes.scaleTo(6));
console.log(typeof Recipe);
console.log(Object.hasOwn(Recipe.prototype, "scaleTo"));
console.log(Object.getPrototypeOf(pancakes) === Recipe.prototype);
```

It prints:

```
[ 'Flour: 100g', 'Milk: 150g', 'Sugar: 10g' ]
[ 'Flour: 300g', 'Milk: 450g', 'Sugar: 30g' ]
function
true
true
```

Your task: rewrite `Recipe` as a **class**, keeping the test code at the bottom exactly the same. Your version must print exactly the same five lines.

Then answer in a comment: the last three lines check how `Recipe` works underneath. Why do they give the same answers for the class version?

<details>
<summary>Hint</summary>

Compare the two `Book` versions in the notes ("Constructor functions" and "Classes are syntax sugar"). The function body becomes the `constructor`, and each `Recipe.prototype.something = function` becomes a method in the class body.

</details>

---

## Exercise 4 (Medium): Today's specials

A restaurant builds today's menu on top of its regular menu with `Object.create`, so the regular dishes are still available. The screen at the door should list **only today's specials**. Copy this into `ex4.js` and run it:

```js
const regularMenu = { soup: 5, salad: 7, burger: 12 };

const todaysMenu = Object.create(regularMenu);
todaysMenu.pasta = 11;
todaysMenu.curry = 13;
todaysMenu.burger = 9; // burger is on special today!

console.log("Today's specials:");
for (const dish in todaysMenu) {
  console.log(`- ${dish}: $${todaysMenu[dish]}`);
}
```

It prints the regular dishes too:

```
Today's specials:
- pasta: $11
- curry: $13
- burger: $9
- soup: $5
- salad: $7
```

Your tasks:

1. Fix the loop so it only lists today's specials.
2. Below it, print how many dishes a customer can order today in total (specials and regular dishes, each counted once).
3. Print today's soup price and the regular burger price.

Expected output:

```
Today's specials:
- pasta: $11
- curry: $13
- burger: $9
Dishes you can order today: 5
Soup today: $5
Regular burger price: $12
```

<details>
<summary>Hint 1</summary>

For task 1, look at the own-vs-inherited table in the notes. Which tools look only at own properties?

</details>

<details>
<summary>Hint 2</summary>

For task 2, the buggy loop is exactly what you need, used on purpose this time. Notice that it visits `burger` only once, even though both menus have one.

</details>

---

## Exercise 5 (Challenge): Property detective

When you write `rex.eat()`, JavaScript searches the prototype chain for `eat`. Now you'll write that search yourself, and report *where* each property was found.

Write a function `findOwner(obj, key)` that walks up the prototype chain of `obj`, one step at a time, and returns one of these strings:

- `name: found on the object itself` (an own property)
- `bark: found on Dog.prototype (1 step up)` (found on a prototype)
- `fly: not found anywhere` (not found before the end of the chain)

Test it with this code:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    return `${this.name} is eating`;
  }
}

class Dog extends Animal {
  bark() {
    return "Woof!";
  }
}

const rex = new Dog("Rex");

for (const key of ["name", "bark", "eat", "toString", "fly"]) {
  console.log(findOwner(rex, key));
}

console.log(findOwner([1, 2, 3], "map"));
console.log(findOwner([1, 2, 3], "length"));
```

Expected output:

```
name: found on the object itself
bark: found on Dog.prototype (1 step up)
eat: found on Animal.prototype (2 steps up)
toString: found on Object.prototype (3 steps up)
fly: not found anywhere
map: found on Array.prototype (1 step up)
length: found on the object itself
```

**Rule:** don't type names like `"Dog"`, `"Animal"` or `"Array"` as strings inside `findOwner`. It must work out each prototype's name by itself, so it works for any object.

<details>
<summary>Hint 1</summary>

Keep a variable for "the object I'm looking at now", starting with `obj`, and a step counter starting at `0`. A `while` loop from [chapter 08](../08-loops/notes.md) can keep going until that variable is `null`, the end of every chain.

</details>

<details>
<summary>Hint 2</summary>

At each step, `Object.hasOwn` tells you whether the property lives right here. If not, move one step up with `Object.getPrototypeOf`.

</details>

<details>
<summary>Hint 3</summary>

To get a prototype's name, remember the `constructor` property from the notes: `Dog.prototype.constructor.name` is `"Dog"`. And watch out for `1 step` vs `2 steps`: the ternary operator from [chapter 07](../07-conditionals/notes.md) can pick the right word.

</details>

---

## Before you move on

Look at your Exercise 5 file: two classes, a helper function, and the test code, all squeezed into one file. Now imagine a real app with fifty classes and hundreds of functions. One giant file would be impossible to find your way around.

In [chapter 29](../29-modules/notes.md), you'll learn to split your code into separate files, called **modules**, and connect them with `import` and `export`.
