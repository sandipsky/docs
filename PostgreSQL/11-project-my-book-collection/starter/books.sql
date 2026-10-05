-- Starter data for chapter 11: My Book Collection.
-- Run this AFTER creating your books table (see starter/README.md for the columns it needs).
-- Ratings, finished flags and dates are made up.

INSERT INTO books (title, author, published_year, pages, genre, rating, is_finished, finished_on)
VALUES
  ('The Hobbit',               'J.R.R. Tolkien',    1937, 310, 'Fantasy',         5, true,  '2025-11-02'),
  ('Matilda',                  'Roald Dahl',        1988, 240, 'Children',        4, true,  '2024-06-15'),
  ('Dune',                     'Frank Herbert',     1965, 412, 'Science Fiction', 5, true,  '2026-01-20'),
  ('Pride and Prejudice',      'Jane Austen',       1813, 279, 'Classic',         4, true,  '2025-03-08'),
  ('The Martian',              'Andy Weir',         2011, 369, 'Science Fiction', 4, true,  '2026-04-11'),
  ('Charlotte''s Web',         'E.B. White',        1952, 184, 'Children',        3, true,  '2024-12-24'),
  ('The BFG',                  'Roald Dahl',        1982, 208, 'Children',        4, true,  '2025-07-30'),
  ('A Brief History of Time',  'Stephen Hawking',   1988, 256, 'Science',         NULL, false, NULL),
  ('Beowulf',                  NULL,                NULL, 213, 'Poetry',          NULL, false, NULL),
  ('Sapiens',                  'Yuval Noah Harari', 2011, 443, 'History',         4, true,  '2025-09-14'),
  ('Atomic Habits',            'James Clear',       2018, 320, 'Self-help',       3, true,  '2026-02-01'),
  ('Project Hail Mary',        'Andy Weir',         2021, 476, 'Science Fiction', 5, true,  '2026-06-28'),
  ('The Name of the Wind',     'Patrick Rothfuss',  2007, 662, 'Fantasy',         5, true,  '2025-12-19'),
  ('Educated',                 'Tara Westover',     2018, 334, 'Memoir',          4, true,  '2026-03-05'),
  ('The Pragmatic Programmer', 'David Thomas',      1999, 352, 'Programming',     NULL, false, NULL),
  ('Clean Code',               'Robert C. Martin',  2008, 464, 'Programming',     3, true,  '2025-05-22'),
  ('The Alchemist',            'Paulo Coelho',      1988, 197, 'Fiction',         2, true,  '2024-09-09'),
  ('Norwegian Wood',           'Haruki Murakami',   1987, 296, 'Fiction',         NULL, false, NULL),
  ('Thinking, Fast and Slow',  'Daniel Kahneman',   2011, 499, 'Psychology',      NULL, false, NULL),
  ('Palpasa Cafe',             'Narayan Wagle',     2005, 216, 'Fiction',         4, true,  '2026-08-17');
