# 07 Classes: Exercises

**How to do these:**

- Work in `playground/ch07/`, one file per exercise.
- Run with `node`, and check types with `npx tsc`. Every exercise must pass `npx tsc` with no errors.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Type the class

Add property declarations and types so `npx tsc` is quiet:

```ts
// no-check
class Book {
  constructor(title, author, pages) {
    this.title = title;
    this.author = author;
    this.pages = pages;
  }

  summary() {
    return `${this.title} by ${this.author}, ${this.pages} pages`;
  }
}

console.log(new Book("Dune", "Frank Herbert", 412).summary());
```

Expected output:

```
Dune by Frank Herbert, 412 pages
```

<details>
<summary>Hint</summary>

Three declarations above the constructor (`title: string;` and so on), three parameter types, and a return type for `summary`.

</details>

---

## Exercise 2 (Easy): A piggy bank

Write a `PiggyBank` class with:

- a `readonly owner` (string), set in the constructor,
- a private `coins` count, starting at 0,
- `add(count: number): void`, and `total(): number`.

```ts
// no-check
const bank = new PiggyBank("Maya");
bank.add(5);
bank.add(3);
console.log(`${bank.owner} has ${bank.total()} coins`);
```

Expected output:

```
Maya has 8 coins
```

Then try `bank.coins = 100;` and `bank.owner = "Sam";`, read both errors, and remove those lines.

<details>
<summary>Hint</summary>

`private coins = 0;` declares and starts it in one line. Try both `private coins` and `#coins`, and notice which one still hides the value when you `console.log(bank)`.

</details>

---

## Exercise 3 (Medium): Payment methods with `implements`

Create `interface PaymentMethod` with a method `pay(amount: number): string`. Then write two classes that implement it:

- `CashPayment` returns `Paid $<amount> in cash`.
- `CardPayment` takes the last 4 digits in its constructor and returns `Paid $<amount> with card ending <last4>`.

Put one of each in a `PaymentMethod[]` array, and pay 25 with each:

```
Paid $25 in cash
Paid $25 with card ending 4242
```

<details>
<summary>Hint</summary>

`class CardPayment implements PaymentMethod { last4: string; constructor(last4: string) { ... } pay(amount: number): string { ... } }`.

</details>

---

## Exercise 4 (Challenge): An abstract employee

Create an `abstract class Employee` with:

- a `name` (string), set in the constructor,
- an abstract method `monthlyPay(): number`,
- a normal method `payslip(): string` that returns `<name>: $<pay>`.

Then create two child classes:

- `SalariedEmployee`: yearly salary in the constructor, pays salary / 12.
- `HourlyEmployee`: hourly rate and hours in the constructor, pays rate × hours.

```ts
// no-check
const staff: Employee[] = [
  new SalariedEmployee("Priya", 60000),
  new HourlyEmployee("Ben", 20, 80),
];
for (const person of staff) {
  console.log(person.payslip());
}
```

Expected output:

```
Priya: $5000
Ben: $1600
```

<details>
<summary>Hint 1</summary>

A child class's constructor must call `super(name)` before using `this`.

</details>

<details>
<summary>Hint 2</summary>

Declare the child's own properties (like `hourlyRate: number;`) inside the child class, not in `Employee`.

</details>
