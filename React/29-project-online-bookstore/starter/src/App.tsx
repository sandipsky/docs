/*
  Paper & Ink — an online bookstore
  =================================
  Your code goes here, plus in the files you'll create alongside it.
  Work one milestone at a time, and check the app in the browser after
  each one. The full guide is in this chapter's notes.md.

  Milestone 1: Routes and a shared Layout
               (BrowserRouter in main.tsx; Layout with header + <Outlet />;
                pages for home, books, one book, cart, and a 404)
  Milestone 2: The book grid, with search and genre filters living in
               useSearchParams — NOT useState
  Milestone 3: The single book page, reading :id with useParams
               (handle both "no id" and "no such book")
  Milestone 4: cart/cartReducer.ts — every cart rule, in one pure function
               WRITE THE REDUCER TESTS BEFORE ANY CART UI EXISTS
  Milestone 5: cart/CartProvider.tsx — two contexts (state + dispatch),
               two guard hooks, no cart props anywhere
  Milestone 6: The cart page, plus a lazily-loaded /checkout route
  Milestone 7: A reusable <Button> (ComponentPropsWithoutRef) and a
               generic <BookGrid> — used on both the books and cart pages
  Milestone 8: Error boundaries per section, and tests for the real flows
  Milestone 9: Profile with the DevTools Profiler. Write the numbers down.
               Changing nothing is a valid — and likely — outcome.

  Three habits that carry the whole project:
    - Sort state into local / URL / shared BEFORE you write it.
    - Every total is derived during render. Nothing computed is stored.
    - Every rule about how the cart changes lives in the reducer.

  The class names the stylesheet expects are in starter/README.md.
*/

function App() {
  return (
    <div className="app">
      <h1 className="shop-name">📚 Paper &amp; Ink</h1>
      <p className="status-message">
        Nothing here yet — start with milestone 1.
      </p>
    </div>
  );
}

export default App;
