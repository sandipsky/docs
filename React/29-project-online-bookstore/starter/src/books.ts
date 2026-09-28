/*
  The bookstore's catalogue.

  This is deliberately a local file rather than an API — chapter 21 already
  covered fetching thoroughly, and this project is about structure: routing,
  shared state, and tests. Stretch goal 5A swaps this for a real fetch.

  The covers are generated placeholder images, so they work offline and
  never 404 on you.
*/

export type Genre = "Sci-Fi" | "Fantasy" | "Crime" | "Non-fiction";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  price: number;
  year: number;
  cover: string;
  description: string;
};

export const GENRES: readonly Genre[] = ["Sci-Fi", "Fantasy", "Crime", "Non-fiction"];

function cover(title: string, colour: string): string {
  const text = encodeURIComponent(title);
  return `https://placehold.co/300x450/${colour}/ffffff?text=${text}`;
}

export const books: Book[] = [
  {
    id: "1",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    price: 9.99,
    year: 1965,
    cover: cover("Dune", "b45309"),
    description:
      "A desert planet, a precious spice, and a young heir caught between prophecy and politics. The book that set the shape of modern science fiction.",
  },
  {
    id: "2",
    title: "Neuromancer",
    author: "William Gibson",
    genre: "Sci-Fi",
    price: 8.5,
    year: 1984,
    cover: cover("Neuromancer", "1e3a5f"),
    description:
      "A burned-out hacker takes one last job in a world of corporate espionage and artificial intelligence. The novel that named cyberspace.",
  },
  {
    id: "3",
    title: "Foundation",
    author: "Isaac Asimov",
    genre: "Sci-Fi",
    price: 7.25,
    year: 1951,
    cover: cover("Foundation", "3f3f46"),
    description:
      "A mathematician predicts the fall of a galactic empire, and builds a plan to shorten the dark age that follows.",
  },
  {
    id: "4",
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    genre: "Fantasy",
    price: 8.99,
    year: 1937,
    cover: cover("The Hobbit", "14532d"),
    description:
      "A comfortable hobbit is talked into an adventure involving dwarves, a mountain, and a dragon who is very much awake.",
  },
  {
    id: "5",
    title: "Small Gods",
    author: "Terry Pratchett",
    genre: "Fantasy",
    price: 7.99,
    year: 1992,
    cover: cover("Small Gods", "7c2d12"),
    description:
      "A great god is reduced to the shape of a tortoise, with one believer left. Funny, and quietly furious about certainty.",
  },
  {
    id: "6",
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    genre: "Sci-Fi",
    price: 9.5,
    year: 1969,
    cover: cover("Left Hand", "312e81"),
    description:
      "An envoy arrives on a frozen world whose people have no fixed gender, and finds that the hardest thing to cross is not the ice.",
  },
  {
    id: "7",
    title: "A Wizard of Earthsea",
    author: "Ursula K. Le Guin",
    genre: "Fantasy",
    price: 6.99,
    year: 1968,
    cover: cover("Earthsea", "0f766e"),
    description:
      "A gifted young wizard lets pride loose something dangerous, and must spend the book learning what it means to be responsible for it.",
  },
  {
    id: "8",
    title: "The Big Sleep",
    author: "Raymond Chandler",
    genre: "Crime",
    price: 6.5,
    year: 1939,
    cover: cover("The Big Sleep", "44403c"),
    description:
      "A private detective takes a blackmail case for a dying millionaire and finds the whole family is worse than the blackmailer.",
  },
  {
    id: "9",
    title: "Gorky Park",
    author: "Martin Cruz Smith",
    genre: "Crime",
    price: 7.75,
    year: 1981,
    cover: cover("Gorky Park", "7f1d1d"),
    description:
      "Three faceless bodies in a Moscow park, and an investigator who keeps asking questions everyone would rather he stopped asking.",
  },
  {
    id: "10",
    title: "The Daughter of Time",
    author: "Josephine Tey",
    genre: "Crime",
    price: 6.25,
    year: 1951,
    cover: cover("Daughter of Time", "581c87"),
    description:
      "A detective stuck in hospital with a broken leg decides to solve a murder from 1483 instead. A whole mystery made of reading.",
  },
  {
    id: "11",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Non-fiction",
    price: 11.99,
    year: 2011,
    cover: cover("Thinking", "1f2937"),
    description:
      "Two systems of thought, one quick and intuitive, one slow and deliberate — and a careful account of how reliably the first one fools us.",
  },
  {
    id: "12",
    title: "The Order of Time",
    author: "Carlo Rovelli",
    genre: "Non-fiction",
    price: 9.25,
    year: 2017,
    cover: cover("Order of Time", "155e75"),
    description:
      "A physicist takes apart the idea that time flows, and rebuilds something stranger and more interesting from what's left.",
  },
];
