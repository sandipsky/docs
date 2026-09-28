/*
  Recipe Finder
  =============
  Your code goes here, plus in whatever new files you create alongside it
  (types.ts, api.ts, SearchForm.tsx, RecipeGrid.tsx, and so on — the notes
  tell you what to build at each step). Work one milestone at a time, and
  check the app in the browser after each one. The full guide is in this
  chapter's notes.md.

  Milestone 1: types.ts, a static controlled SearchForm, and a ref that
               focuses the search box on load
  Milestone 2: Search on submit — searchRecipes in api.ts, and the
               isLoading / error / data three-state pattern from chapter 18
  Milestone 3: RecipeCard.tsx and RecipeGrid.tsx — a real results grid
               (read starter/README.md on the card structure before you
               build the card — it matters again in milestone 7)
  Milestone 4: Click a card to see full details in a RecipeModal
  Milestone 5: Extract useRecipeSearch.ts and useRecipeDetails.ts
  Milestone 6: Live search, using useDebounce from chapter 20
  Milestone 7: Favourites — useLocalStorage.ts, a heart button, and a
               favourites view built on Promise.all
  Milestone 8: A category filter, narrowing the current results client-side

  The API is TheMealDB (no key needed — see starter/README.md for the
  endpoints and the class names the stylesheet expects).

  Two habits worth keeping the whole way through:
    - Raw TheMealDB field names (strMeal, idMeal, ...) should only ever
      appear inside api.ts. Everywhere else works with your own clean types.
    - Never store more in localStorage than you actually need to remember.
*/

function App() {
  return (
    <div className="app">
      <h1 className="app-title">🍳 Recipe Finder</h1>

      {/* Milestone 1: the search form goes here */}

      {/* Milestone 7: the Favourites toggle goes here */}

      {/* Milestone 8: the category filter goes here */}

      {/* Milestone 2/3: loading / error / the results grid go here */}

      {/* Milestone 4: the recipe detail modal goes here */}
    </div>
  );
}

export default App;
