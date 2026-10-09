# React: Building User Interfaces

React is a JavaScript **library** (code someone else wrote that you can use in your own projects) for building user interfaces. You build a page from small, reusable pieces called **components**, like snapping LEGO bricks together. When your data changes, React updates the page for you.

This course takes you from your first component to building and deploying full apps with the tools real teams use. There are 41 chapters in five levels, plus a reference chapter (00) on setting up a real project. The numbered chapters go in order, and each one builds on the ones before it.

**Before you start:** finish at least Levels 1 to 3 of the [JavaScript course](../JavaScript/README.md), and the whole [TypeScript course](../TypeScript/README.md). React uses a lot of modern JavaScript, like array methods, destructuring, modules, and `fetch`. And this course is written in TypeScript from the very first chapter.

## How to use this folder

1. **Read** the chapter's `notes.md`.
2. **Type every example yourself** in your practice app (set up in chapter 01). Don't copy and paste.
3. **Do the exercises** in `exercises.md`. Try on your own before you open a hint.
4. **Ask Claude to check your work** when you're done or stuck.
5. **Tick the chapter off** below (change `[ ]` to `[x]`).

**What you need:** Node.js, VS Code, and a web browser (Chrome or Edge). Chapter 01 creates your first React app with a tool called Vite.

**TypeScript from day one:** every chapter uses TypeScript, in `.tsx` files. Each time you learn something new in React, you also learn how to type it. For example, you'll type props in chapter 04, events in chapter 07, and state in chapter 08.

**Plain React first, then libraries:** React only handles what's on the screen. For jobs like calling APIs, checking forms, and moving between pages, most teams add extra libraries. You'll always learn the plain React way first, then the library. That way you know what problem each library solves, and when you don't need it.

**Versions:** this course is written for React 19. The libraries around React (like routers, TanStack Query, and Zod) release new versions more often than React does, so each chapter says which version it uses.

**Projects:** five chapters are projects where you build something real. Some come with a `starter/` folder, so you can focus on the React parts.

---

## Level 0: Project Setup

*A reference, not a lesson: skim it now, follow it when you start a real project (chapters 37 and 41, or your own). It uses the Level 4 libraries.*

- [ ] [00 Project Setup](00-project-setup/notes.md): setting up a real React + TypeScript project by hand, step by step: Vite, the toolbox libraries, environment variables, a feature folder structure, file-based routes, and a mock API

## Level 1: The Basics

*Goal: build small, interactive pages out of components.*

- [ ] [01 Getting Started](01-getting-started/notes.md): what React is, and your first React + TypeScript app with Vite
- [ ] [02 JSX](02-jsx/notes.md): writing HTML-like code inside JavaScript
- [ ] [03 Components](03-components/notes.md): building pages from small, reusable pieces
- [ ] [04 Props](04-props/notes.md): passing information into a component
- [ ] [05 Conditional Rendering](05-conditional-rendering/notes.md): showing things only when they should appear
- [ ] [06 Rendering Lists](06-rendering-lists/notes.md): turning arrays into lists on screen, and why keys matter
- [ ] [07 Events](07-events/notes.md): reacting to clicks, typing, and more
- [ ] [08 State](08-state/notes.md): letting a component remember things with `useState`
- [ ] [09 Forms](09-forms/notes.md): getting input from users, the React way
- [ ] [10 Project: To-Do App, the React Way](10-project-todo-app/notes.md): rebuild your JavaScript to-do app and compare

## Level 2: Thinking in React

*Goal: organize your data well, talk to the outside world, and reuse your logic.*

- [ ] [11 Updating Objects and Arrays in State](11-updating-objects-and-arrays/notes.md): why you copy instead of change
- [ ] [12 How Rendering Works](12-how-rendering-works/notes.md): what happens when state changes, and why it doesn't change right away
- [ ] [13 Lifting State Up](13-lifting-state-up/notes.md): sharing state between components
- [ ] [14 Thinking in React](14-thinking-in-react/notes.md): turning a design into components, step by step
- [ ] [15 Styling](15-styling/notes.md): CSS files, CSS Modules, and class names
- [ ] [16 Tailwind CSS](16-tailwind-css/notes.md): styling with small, ready-made classes
- [ ] [17 Effects](17-effects/notes.md): syncing with things outside React using `useEffect`
- [ ] [18 Fetching Data](18-fetching-data/notes.md): loading, errors, and showing data from an API
- [ ] [19 Refs](19-refs/notes.md): remembering values without re-rendering, and reaching page elements with `useRef`
- [ ] [20 Custom Hooks](20-custom-hooks/notes.md): packaging logic so you can reuse it
- [ ] [21 Project: Recipe Finder](21-project-recipe-finder/notes.md): search a free recipe API and show the results

## Level 3: Real Apps

*Goal: build multi-page apps with shared data, types, and tests.*

- [ ] [22 Context](22-context/notes.md): sharing data without passing props through every layer
- [ ] [23 useReducer](23-use-reducer/notes.md): managing complex state with actions
- [ ] [24 React Router](24-react-router/notes.md): multiple pages in one app (you may know it as `react-router-dom`)
- [ ] [25 TypeScript Patterns for React](25-typescript-patterns/notes.md): generic components, reusing HTML props, and props that depend on each other
- [ ] [26 Error Boundaries and Suspense](26-error-boundaries-and-suspense/notes.md): handling crashes and loading screens gracefully
- [ ] [27 Performance](27-performance/notes.md): `memo`, `useMemo`, `useCallback`, and when not to bother
- [ ] [28 Testing](28-testing/notes.md): checking your components with Vitest and React Testing Library
- [ ] [29 Project: Online Bookstore](29-project-online-bookstore/notes.md): pages, a shared cart, and tests, all working together

## Level 4: The React Toolbox

*Goal: learn the libraries most React teams use, and when each one is worth adding.*

- [ ] [30 Axios](30-axios/notes.md): a friendlier way to call APIs than `fetch`
- [ ] [31 TanStack Query](31-tanstack-query/notes.md): fetching, caching, and updating server data without writing it all yourself
- [ ] [32 Zod](32-zod/notes.md): checking that data really has the shape you expect
- [ ] [33 React Hook Form](33-react-hook-form/notes.md): bigger forms with less code, and validation with Zod
- [ ] [34 Zustand](34-zustand/notes.md): a small, simple store for data many components share
- [ ] [35 Redux Toolkit](35-redux-toolkit/notes.md): the big, well-known way to manage app-wide state
- [ ] [36 TanStack Router](36-tanstack-router/notes.md): a router that uses TypeScript to catch broken links and bad page data
- [ ] [37 Project: Task Board](37-project-task-board/notes.md): a full app with a practice API, using the whole toolbox together

## Level 5: Mastery

*Goal: build apps that everyone can use, and ship them for the world to see.*

- [ ] [38 Accessibility](38-accessibility/notes.md): building apps everyone can use, including people with screen readers
- [ ] [39 Next.js and Server Components](39-nextjs-and-server-components/notes.md): React frameworks, and code that runs on the server
- [ ] [40 Deploying](40-deploying/notes.md): putting your app online
- [ ] [41 Final Project](41-final-project/notes.md): build something of your own, from start to finish

---

**After this:** Node.js frameworks (like Express) let you build your own APIs for your React apps to talk to. React Native lets you use what you've learned to build phone apps. Each will get its own folder.
