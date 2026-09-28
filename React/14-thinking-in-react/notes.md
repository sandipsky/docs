# 14 Thinking in React

## What is it?

A repeatable method for turning a design — a mockup, a sketch, a screenshot of an app you're copying — into working React code. Five steps:

1. Break the UI into a component hierarchy.
2. Build a static version, with no state at all.
3. Find the minimal set of state that represents everything that can change.
4. Decide where each piece of that state lives.
5. Add the events that flow data back up.

You already know every tool this method uses — components, props, state, lifting state up. This chapter is about the **order** to apply them in, so that a blank page and a design don't leave you staring, unsure where to start.

## Why does it matter?

Every chapter so far started with the code already half-decided for you: "build a `MenuItem` that takes `name` and `price`." Real work doesn't arrive like that. It arrives as a Figma file, a screenshot, or "make it look like this other site," and *you* have to decide what the components are, what's state, and where that state should live.

Without a method, it's easy to start writing JSX for the whole page at once, discover three screens in that you need to share a value between two far-apart bits of it, and end up restructuring everything. This chapter's method front-loads exactly the decisions that are expensive to get wrong later — component boundaries and where state lives — before you've written much code to un-write.

## Real-world example

Think about how an **architect** designs a house, not a builder swinging a hammer on day one.

| Building a house | Thinking in React |
|---|---|
| Mark out the rooms on the floor plan | Break the UI into components |
| Build the shell, walls, doors, windows — no plumbing or wiring yet | Build a static version |
| Decide what actually needs power and water, and where | Find the minimal state |
| Decide which room has the fuse box and the stopcock | Decide where state lives |
| Wire the switches to the lights | Add the events that flow data back up |

Nobody starts a house by wiring a light switch before the wall it's on exists. The order matters, and it matters for the same reason here: structure first, behaviour second.

## How it works

### The example for this chapter

A small inventory search tool for a hardware shop. Given this data:

```tsx
type Product = {
  id: string;
  name: string;
  category: "Tools" | "Fixings" | "Paint";
  price: number;
  inStock: boolean;
};

const products: Product[] = [
  { id: "1", name: "Claw Hammer", category: "Tools", price: 12.5, inStock: true },
  { id: "2", name: "Wood Screws (100)", category: "Fixings", price: 4.25, inStock: true },
  { id: "3", name: "Masonry Drill Bit", category: "Tools", price: 6.0, inStock: false },
  { id: "4", name: "Matt White Paint 2.5L", category: "Paint", price: 18.99, inStock: true },
  { id: "5", name: "Wall Plugs (50)", category: "Fixings", price: 2.75, inStock: false },
];
```

it should show a search box, an "in stock only" checkbox, and a table of matching products grouped by category:

```
Search: [           ]     [x] In stock only

Tools
  Claw Hammer               $12.50

Fixings
  Wood Screws (100)         $4.25

Paint
  Matt White Paint 2.5L     $18.99
```

### Step 1: break the UI into a component hierarchy

Look at the design and draw boxes around things, the way you'd draw boxes around paragraphs in a document. The rule of thumb from [chapter 03](../03-components/notes.md) still applies: **one component per meaningful chunk**, and a chunk you'd give a name if you were describing the page out loud.

```
InventoryPage
├── SearchControls      (the search box and the checkbox)
└── ProductTable
    └── CategorySection  (one per category: Tools, Fixings, Paint)
        └── ProductRow   (one per product)
```

A useful test: if you can point at a rectangle in the design and say its name in one breath — "that's the search bar," "that's a product row" — it's probably a component. Notice this step needed **no code and no state**. It's purely about shape.

### Step 2: build a static version

Now write the JSX for that whole hierarchy, using **plain props, no state at all**. Everything is hard-coded or passed straight down from the top, exactly the way you built components in [chapters 03 and 04](../03-components/notes.md), before [chapter 08](../08-state/notes.md) existed.

```tsx
function ProductRow({ product }: { product: Product }) {
  return (
    <tr>
      <td>{product.name}</td>
      <td>${product.price.toFixed(2)}</td>
    </tr>
  );
}

function CategorySection({ category, products }: { category: string; products: Product[] }) {
  return (
    <>
      <tr><th colSpan={2}>{category}</th></tr>
      {products.map((product) => (
        <ProductRow key={product.id} product={product} />
      ))}
    </>
  );
}

function ProductTable({ products }: { products: Product[] }) {
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <table>
      <tbody>
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            products={products.filter((p) => p.category === category)}
          />
        ))}
      </tbody>
    </table>
  );
}

function SearchControls() {
  return (
    <div>
      <input type="text" placeholder="Search..." />
      <label><input type="checkbox" /> In stock only</label>
    </div>
  );
}

function InventoryPage() {
  return (
    <div>
      <SearchControls />
      <ProductTable products={products} />
    </div>
  );
}
```

Data only flows **down** here — props, all the way — exactly one direction, same as every chapter so far. Nothing is interactive yet: typing in the search box does nothing, the checkbox does nothing. That's correct. This step is about proving the *shape* works and the data reaches everywhere it needs to, before a single line of state complicates it. It's more typing than jumping straight to the "real" version feels like it should need, and it's worth it: bugs in structure are far easier to see and fix when nothing is moving yet.

### Step 3: find the minimal but complete state

This is the step most worth slowing down for. Go through **every piece of data** in your app and ask three questions about each:

1. **Does it stay the same over time?** If yes, it's not state — it's a constant, like your `products` array (well, until step 5 gives you a reason to change that).
2. **Can you calculate it from other state or props?** If yes, it's not state either — it's a [derived value](../08-state/notes.md).
3. **Does it change because of something the user does, and can you not work it out from anything else?** If yes to all of that, it's real state.

Walk through the candidates for this page:

| Candidate | Does it change? | Can it be derived? | Real state? |
|---|---|---|---|
| The full `products` list | No (for now) | — | No — it's a constant |
| What's typed in the search box | Yes | No | **Yes** |
| Whether "in stock only" is ticked | Yes | No | **Yes** |
| The list of products matching the search and the filter | Yes | Yes — from `products`, the search text, and the checkbox | No — derive it |
| The categories present in the filtered results | Yes | Yes — from the filtered list | No — derive it |

Two pieces of real state survive: the **search text** and the **stock filter**. Everything else on the page — the filtered products, the grouped categories — gets worked out fresh on every render, the same "don't store what you can calculate" rule from [chapter 08](../08-state/notes.md), now applied at the scale of a whole feature instead of one component.

This is the step people skip, and it's the one that saves you the most trouble. Storing the filtered list *as well as* the search text means keeping them in sync by hand forever. Storing only the two real inputs means the filtered list literally cannot go stale, because it's recalculated from them every time.

### Step 4: identify where each piece of state should live

For each piece of state, find **every component that reads it or writes it**, then find their closest common parent — exactly the process from [chapter 13](../13-lifting-state-up/notes.md).

- **Search text**: read and written by `SearchControls`. Also needed by `ProductTable`, to know what to show. `SearchControls` and `ProductTable` are siblings, so it belongs in their common parent: `InventoryPage`.
- **Stock filter**: same story, same components, same answer: `InventoryPage`.

Sometimes this step reveals that a component you drew in step 1 doesn't actually need to exist as its own state-holder — it's just a shape for the JSX. That's fine. Step 1 was about visual structure; this step is about data ownership, and they don't always draw the same lines.

### Step 5: add inverse data flow

"Inverse" just means **up**, the direction props don't go on their own — the callback-prop pattern from [chapter 07](../07-events/notes.md). Now that state lives in `InventoryPage`, the components below it need a way to ask for changes.

```tsx
type SearchControlsProps = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
};

function SearchControls({
  searchText,
  onSearchTextChange,
  inStockOnly,
  onInStockOnlyChange,
}: SearchControlsProps) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => onInStockOnlyChange(event.target.checked)}
        />
        In stock only
      </label>
    </div>
  );
}

function InventoryPage() {
  const [searchText, setSearchText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStock = !inStockOnly || product.inStock;
    return matchesSearch && matchesStock;
  });

  return (
    <div>
      <SearchControls
        searchText={searchText}
        onSearchTextChange={setSearchText}
        inStockOnly={inStockOnly}
        onInStockOnlyChange={setInStockOnly}
      />
      <ProductTable products={filtered} />
    </div>
  );
}
```

`ProductTable`, `CategorySection` and `ProductRow` don't change **at all** from step 2. They were already built to take a `products` array as a prop and display it — they have no idea whether that array is the full list or a filtered one, and they don't need to. All the new logic landed in exactly the two places step 4 said it should: the two controls that write the state, and the one component that owns it.

### Why the order matters

Notice what each step protected you from:

- Doing step 3 **before** step 1 would mean guessing at state before you know what's actually on the page.
- Doing step 5 **before** step 3 would mean wiring up `onChange` handlers before you've decided what they're even supposed to set.
- Skipping step 2 tends to produce components tangled up with state from the very first line, which makes it much harder to later notice that half of what you stored could have been derived.

The method isn't a rulebook you must follow to the letter forever. Once this becomes second nature, you'll blend the steps without thinking about it. But when you're stuck looking at a design with no idea where to begin, coming back to these five steps in order is a reliable way to get moving again.

### A second, smaller example: a tabbed panel

Worth doing once quickly with less data, to see the method isn't just for tables.

**Design:** three tabs (`Details`, `Reviews`, `Shipping`), one panel of content visible at a time.

1. **Hierarchy:** `ProductPage` → `TabBar` + `TabPanel`.
2. **Static version:** hard-code which tab shows, render `TabBar` (three buttons, none wired up) and `TabPanel` (always showing "Details," say).
3. **Minimal state:** the only thing that changes is *which* tab is active. That's one piece of state — a string, constrained to the three tab names with a union type, not three separate booleans (`"details" | "reviews" | "shipping"`, echoing the lookup-object pattern from [chapter 05](../05-conditional-rendering/notes.md)).
4. **Where it lives:** both `TabBar` (to highlight the active one and to change it) and `TabPanel` (to know what to show) need it, and they're siblings — so it lives in `ProductPage`.
5. **Inverse flow:** `TabBar` takes `activeTab` and `onTabChange`, and calls `onTabChange` when a button is clicked.

Same five steps, a tenth of the size. The method scales down as well as up.

## Common mistakes

**1. Writing state and interactivity from the very first line**

Jumping straight to `useState` before the component shapes exist tends to produce state that doesn't match what the page actually needs — too much, too little, or in the wrong component. Build the static version first.

**2. Storing a value that step 3 would have caught**

```tsx
const [filteredProducts, setFilteredProducts] = useState(products);   // ❌
```

If you find yourself calling a setter every time *another* piece of state changes, just to "keep something updated," that something almost always shouldn't have been state at all. Derive it instead.

**3. Putting state in the wrong component out of convenience**

```tsx
function SearchControls() {
  const [searchText, setSearchText] = useState("");   // only SearchControls can see it
  // ...
}
```

It compiles, and the input works — right up until `ProductTable`, a sibling, also needs `searchText` and has no way to get it. This is the exact symptom [chapter 13](../13-lifting-state-up/notes.md) is about. Step 4 exists to catch this before you've written the component.

**4. Treating the five steps as a one-way street**

Real design work loops. Building the static version (step 2) often reveals a component boundary from step 1 that doesn't actually make sense once there's real JSX in it. Redraw the boxes and carry on — the method is a guide, not a contract.

**5. Skipping the "can I derive it?" question for anything that isn't obviously a number or a list**

Booleans slip through this check constantly. `isFormValid`, `hasResults`, `isEmpty` — all of these are almost always one line computed from other state, not state of their own.

## Quick recap

- Five steps, in order: **break the UI into components**, **build a static version with no state**, **find the minimal state**, **decide where each piece lives**, **add the events that flow data back up**.
- For every candidate piece of state, ask: does it change, and can it be worked out from something else? If it can be derived, it isn't state.
- To find where a piece of state should live, find every component that reads or writes it and put it in their closest common parent — the same process as [chapter 13](../13-lifting-state-up/notes.md).
- The static version from step 2 usually needs **no changes at all** once state is wired up in step 5 — the new logic lands entirely in the components that own and write the state.
- The method isn't a strict pipeline. Real design loops back on itself; the value is having a reliable place to start and a reliable order to come back to when you're stuck.

---

**Next:** try the [exercises](exercises.md), then move on to [15 Styling](../15-styling/notes.md).
