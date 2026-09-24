# 07 Conditionals: Exercises

**How to do these:**

- Make a new file for each exercise in this folder (`ex1.js`, `ex2.js`, and so on).
- Run each one with `node ex1.js` from a terminal opened in this folder.
- Most exercises ask you to test several values. Change the variable at the top, save, and run the file again each time.
- Try on your own first. Only open a hint if you've been stuck for a while.
- When you're done, ask Claude to check your code.

---

## Exercise 1 (Easy): Gym lockers

Your gym has 100 lockers, numbered 1 to 100. Even-numbered lockers are in the left changing room, and odd-numbered ones are in the right changing room.

```js
const lockerNumber = 37;
```

Print where the locker is. Test it with these numbers:

| `lockerNumber` | Expected output |
|---|---|
| `37` | `Locker 37 is in the right changing room.` |
| `12` | `Locker 12 is in the left changing room.` |
| `250` | `There is no locker 250.` |
| `0` | `There is no locker 0.` |

<details>
<summary>Hint 1</summary>

Remember `%` from [chapter 04](../04-operators/notes.md)? It gives you the remainder of a division. An even number divided by 2 leaves a remainder of 0.

</details>

<details>
<summary>Hint 2</summary>

Check for the lockers that don't exist *first*. That's the problem case. Once you know the number is between 1 and 100, you only have to decide left or right.

</details>

---

## Exercise 2 (Easy): Exam results

A school turns exam scores into grades:

| Score | Grade |
|---|---|
| 90 and above | A |
| 80 to 89 | B |
| 70 to 79 | C |
| 60 to 69 | D |
| below 60 | F |

A score of 60 or more is a pass.

```js
const score = 85;
```

Expected output:

```
Score 85: grade B
Result: passed
```

Test it with 95, 72, 64, and 40 as well. For 40 you should see:

```
Score 40: grade F
Result: failed
```

**Rule:** use a ternary for the `Result` line.

<details>
<summary>Hint 1</summary>

Remember that the first true condition wins. Which grade should you check for first?

</details>

<details>
<summary>Hint 2</summary>

Save the grade in a variable created with `let` before your `if`, like the cinema ticket example in the notes. Then print it once at the end.

</details>

---

## Exercise 3 (Medium): Game settings

Your game saves the player's settings. If a setting was never saved, it's `null`.

```js
const savedVolume = 0;
const savedPlayerName = "";
const savedDifficulty = null;
```

Load each setting, using a default when it's missing:

- **Volume:** the default is `50`. But `0` is a real choice: the player muted the game.
- **Player name:** the default is `"Player 1"`. An empty name isn't allowed, so it gets the default too.
- **Difficulty:** the default is `"normal"`.

When the volume is `0`, add ` (muted)` after it.

Expected output:

```
Volume: 0 (muted)
Player: Player 1
Difficulty: normal
```

Then try `70`, `"Zara"`, and `"hard"`:

```
Volume: 70
Player: Zara
Difficulty: hard
```

And finally set all three to `null`:

```
Volume: 50
Player: Player 1
Difficulty: normal
```

**Rule:** use `??` or `||` for each setting (not `if`). Pick the right one each time.

<details>
<summary>Hint 1</summary>

For each setting, ask the question from the notes: "Is `0` or an empty string a real, valid answer here?"

</details>

<details>
<summary>Hint 2</summary>

For the ` (muted)` part, a ternary inside the template literal works well. When the volume isn't `0`, it can give you an empty string `""`.

</details>

---

## Exercise 4 (Medium): Gym opening hours

Your gym's website shows the opening hours for the day:

- Monday to Thursday: 6:00 to 22:00
- Friday: 6:00 to 23:00 (it's late night Friday!)
- Saturday and Sunday: 8:00 to 20:00

```js
const day = "Saturday";
```

Test it with these days:

| `day` | Expected output |
|---|---|
| `"Saturday"` | `Saturday: open 8:00 to 20:00` |
| `"Tuesday"` | `Tuesday: open 6:00 to 22:00` |
| `"Friday"` | `Friday: open 6:00 to 23:00 (late night!)` |
| `"Funday"` | `Funday is not a day of the week.` |

**Rules:**

- Use one `switch`.
- Days with the same hours must share one `console.log`. Don't write the same line four times.

<details>
<summary>Hint 1</summary>

Stack the cases that share hours on top of each other, like the `W` key and the up arrow in the notes.

</details>

<details>
<summary>Hint 2</summary>

If "Funday" prints the wrong thing, which part of the `switch` runs when no case matches? And if one day prints *several* lines, check your `break`s.

</details>

---

## Exercise 5 (Challenge): Login check

Build the logic behind a website's login button. Here's what the website has saved, and what someone just typed:

```js
const savedUsername = "sandip";
const savedPassword = "Mango#2026";
const nickname = null; // null means the user hasn't picked a nickname

const typedUsername = "  Sandip ";
const typedPassword = "Mango#2026";
const failedAttempts = 0;
```

Print one message. Check things in this order:

1. If there have been 3 or more failed attempts: `Account locked. Try again in 15 minutes.`
2. If either box is empty: `Please fill in both boxes.` (A username with only spaces counts as empty.)
3. If the username or the password is wrong: `Wrong username or password.`
4. Otherwise: `Welcome back, NAME!` where `NAME` is the nickname, or the saved username if there's no nickname.

Usernames don't care about capitals or spaces around them, so `"  Sandip "` is fine. Passwords are exact: capitals matter.

Test all of these:

| `typedUsername` | `typedPassword` | `failedAttempts` | `nickname` | Expected output |
|---|---|---|---|---|
| `"  Sandip "` | `"Mango#2026"` | `0` | `null` | `Welcome back, sandip!` |
| `"SANDIP"` | `"Mango#2026"` | `1` | `"Sandy"` | `Welcome back, Sandy!` |
| `"sandip"` | `"mango#2026"` | `0` | `null` | `Wrong username or password.` |
| `"   "` | `"Mango#2026"` | `0` | `null` | `Please fill in both boxes.` |
| `"sandip"` | `""` | `2` | `null` | `Please fill in both boxes.` |
| `"sandip"` | `"Mango#2026"` | `3` | `null` | `Account locked. Try again in 15 minutes.` |

<details>
<summary>Hint 1</summary>

Clean up the typed username first, using two string methods from [chapter 06](../06-strings/notes.md). Save it in a new variable and use that one in all your checks.

</details>

<details>
<summary>Hint 2</summary>

One `if` with three `else if`s, in the order above. The "wrong" check is true if the username doesn't match **or** the password doesn't match.

</details>

<details>
<summary>Hint 3</summary>

For the name in the welcome message, you need a default value for when `nickname` is `null`. You learned two operators for that.

</details>

**Why "username or password"?** Real websites don't say *which* one was wrong. Otherwise an attacker could use the message to find out which usernames exist. (Real websites also never store passwords as plain text. You'll learn more in [chapter 51](../51-security-basics/notes.md).)

---

## Before you move on

In Exercise 5, you changed the variables and ran the file again for every attempt. A real login screen lets you try again by itself, up to 3 times, and then locks.

Doing something again and again, until a condition says stop, is what [chapter 08: Loops](../08-loops/notes.md) is all about.
