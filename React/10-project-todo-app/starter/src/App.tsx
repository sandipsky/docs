/*
  To-Do List App — the React way
  ==============================
  Your code goes here. Build the app one milestone at a time, and check the
  page in the browser after each one. The full guide is in this chapter's
  notes.md.

  Milestone 1: A Task type, and three hard-coded tasks on the page
               (types.ts, TaskItem.tsx, TaskList.tsx — mind your keys)
  Milestone 2: The "2 tasks left" counter, and the empty-list message
  Milestone 3: Move the tasks into state with useState<Task[]>
  Milestone 4: Add a task with a controlled form (AddTaskForm.tsx)
  Milestone 5: Tick a task off (onToggle, and map with a spread)
  Milestone 6: Delete a task (onDelete, and filter)
  Milestone 7: Filter the list — All, Active, Completed — and Clear completed
  Milestone 8: Save to localStorage, and load it when the page opens

  Two rules to keep in mind the whole way through:
    - Never change an array or object in place. Always make a new one.
    - Never store anything you could work out during the render.

  The class names the stylesheet expects are listed in starter/README.md.
*/

function App() {
  return (
    <div className="app">
      <h1 className="app-title">My To-Do List</h1>

      {/* Milestone 4: the add-task form goes here */}

      {/* Milestone 7: the filter buttons go here */}

      {/* Milestone 1: the task list goes here */}

      {/* Milestone 2: the footer with the counter goes here */}
    </div>
  );
}

export default App;
