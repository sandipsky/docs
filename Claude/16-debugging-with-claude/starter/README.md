# Checkout

A small program that reads a shopping cart and prints a receipt. It needs Node.js 20 or newer and no packages.

```
npm start     print the receipt for data/cart.json
npm test      run the tests
```

## It is broken on purpose

There are three bugs in here. Each one shows up in a different way:

1. One makes the program **crash**.
2. One gives a **wrong answer** with no error at all.
3. One makes a **test fail**.

Chapter 16 walks you through finding them with Claude. Don't read the code hunting for them first: the point is to practise the debugging conversation.

## The shop's rules

- Prices in the cart file are text, like `"$4.50"` or `"$1,299.00"`.
- **Bulk discount:** buy 3 or more of the same item and that line gets 10% off.
- The receipt for the sample cart should end with `Total: $1321.95`.
