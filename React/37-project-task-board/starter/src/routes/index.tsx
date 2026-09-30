/*
  The board: the page at "/".
  Milestone 3 fills it with three columns of tasks from one query.
  Milestone 4 adds validateSearch to the options below, for the filters.
  Milestone 7 calls useMoveTask here, once, for every card.
*/

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: BoardPage,
});

function BoardPage() {
  return (
    <>
      <h1 className="page-title">Board</h1>
      <p className="status-message">Nothing here yet — start with milestone 1.</p>
    </>
  );
}
