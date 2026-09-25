# 07 Classes

## What is it?

Classes in TypeScript are JavaScript classes ([JavaScript chapter 27](../../JavaScript/27-classes/notes.md)) with a few extras: typed properties, **access modifiers** (`public`, `private`, `protected`), `readonly`, and `implements`, which checks that a class follows an interface.

## Why does it matter?

A class is a blueprint for many objects. If the blueprint has a mistake, like a property that's never set or a method with the wrong name, every object made from it has that mistake.

TypeScript checks the blueprint itself: every property is declared with a type, every property gets a starting value, and code outside the class can't touch what's marked private.

## Real-world example

A bank account:

| Bank | TypeScript class |
|---|---|
| Your account number never changes | `readonly accountNumber` |
| Only the bank can change your balance directly | `private balance` |
| Anyone can ask to deposit | `public deposit()` |
| Every branch must offer the same services | `implements BankServices` |

## How it works

### Declare your properties

In TypeScript, a class lists its properties with their types, before the constructor:

```ts
class Pet {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  describe(): string {
    return `${this.name} is ${this.age}`;
  }
}

const rex = new Pet("Rex", 3);
console.log(rex.describe()); // prints: Rex is 3
```

If you forget to give a declared property a value, strict mode tells you:

```ts
class Pet {
  name: string;
  // ❌ Property 'name' has no initializer and is not definitely assigned in the constructor.
}
```

A property can also get its value right where it's declared, like `visits = 0;`. Then TypeScript infers its type.

### `private` and `public`

Everything is `public` by default: usable from anywhere. Mark a property `private` to allow it only inside the class:

```ts
class BankAccount {
  private balance = 0;

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}

const account = new BankAccount();
account.deposit(50);
console.log(account.getBalance()); // prints: 50
account.balance = 1000000;
// ❌ Property 'balance' is private and only accessible within class 'BankAccount'.
```

### `private` or `#private`?

You learned JavaScript's own `#balance` in chapter 27. What's the difference?

| | `private balance` | `#balance` |
|---|---|---|
| Checked by | TypeScript only | JavaScript itself |
| Still hidden when the code runs? | No, types disappear | Yes |

TypeScript's `private` is a type check. Once the code runs, it's gone, like all types. `#balance` is real privacy, enforced by JavaScript. For new code, `#` is the safer choice. You'll see `private` a lot in existing code, so it's good to know both.

`protected` is a third option: like `private`, but child classes (made with `extends`) can use it too.

### `readonly`

`readonly` properties can be set in the constructor, then never again:

```ts
class Ticket {
  readonly id: string;
  seat: string;

  constructor(id: string, seat: string) {
    this.id = id;
    this.seat = seat;
  }
}

const ticket = new Ticket("T-1", "F7");
ticket.seat = "F8"; // fine: seat can change
ticket.id = "T-2";
// ❌ Cannot assign to 'id' because it is a read-only property.
```

### `implements`: promise to follow an interface

An interface can describe what a class must have. `implements` makes TypeScript check it:

```ts
interface Notifier {
  send(message: string): void;
}

class EmailNotifier implements Notifier {
  send(message: string): void {
    console.log(`Email: ${message}`);
  }
}

class SmsNotifier implements Notifier {
  send(message: string): void {
    console.log(`SMS: ${message}`);
  }
}

const notifiers: Notifier[] = [new EmailNotifier(), new SmsNotifier()];
for (const notifier of notifiers) {
  notifier.send("Your order has shipped");
}
```

You'll see:

```
Email: Your order has shipped
SMS: Your order has shipped
```

If a class forgets something, the error appears on the class itself:

```ts
interface Notifier {
  send(message: string): void;
}

class PushNotifier implements Notifier {}
// ❌ Class 'PushNotifier' incorrectly implements interface 'Notifier'.
```

This is the strategy pattern from [JavaScript chapter 44](../../JavaScript/44-design-patterns/notes.md), with TypeScript making sure every strategy has the same shape.

### Abstract classes

An `abstract` class is a half-finished blueprint. You can't make objects from it directly. Child classes fill in the missing parts:

```ts
abstract class Shape {
  abstract area(): number; // no body: child classes must write it

  describe(): string {
    return `Area: ${this.area().toFixed(1)}`;
  }
}

class Circle extends Shape {
  radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

console.log(new Circle(2).describe()); // prints: Area: 12.6
```

`new Shape()` would give the error `Cannot create an instance of an abstract class.`

### A shortcut you'll see elsewhere

In other TypeScript code, you'll often see this shortcut, called **parameter properties**:

```ts
// no-check
class Pet {
  constructor(public name: string, private age: number) {}
}
```

It declares and sets the properties in one line. But Node can't run it directly, and our `erasableSyntaxOnly` setting reports `This syntax is not allowed when 'erasableSyntaxOnly' is enabled.` So in this course, declare properties the long way. Just recognize the shortcut when you see it.

## Common mistakes

**1. Assigning a property you never declared**

```ts
class Pet {
  constructor(name: string) {
    this.name = name;
    // ❌ Property 'name' does not exist on type 'Pet'.
  }
}
```

Declare it first: `name: string;` above the constructor.

**2. Thinking `private` protects data at run time**

`private` disappears when types are removed. For real protection, use `#`.

**3. Using a class when a plain object would do**

If your class has no methods and no private data, an `interface` and a plain object are simpler (the KISS principle).

## Quick recap

- Declare class properties with types above the constructor, and give each one a starting value.
- `private` limits a property to inside the class, `protected` to the class and its children, and `public` is the default.
- TypeScript's `private` is only a type check. JavaScript's `#` is real privacy.
- `readonly` properties can only be set in the constructor.
- `implements` checks that a class matches an interface. `abstract` classes leave parts for child classes to fill in.

---

**Next:** try the [exercises](exercises.md), then move on to [08 Generics](../08-generics/notes.md).
