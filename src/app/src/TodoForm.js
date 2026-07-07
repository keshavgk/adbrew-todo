import { useState } from "react";

function TodoForm({ onAdd }) {
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed);
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="todo">ToDo: </label>
      <input
        id="todo"
        type="text"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button type="submit">Add To Do!</button>
    </form>
  );
}

export default TodoForm;