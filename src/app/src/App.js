import { useState, useEffect } from "react";
import "./App.css";
import { fetchTodos, createTodo } from "./api";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

function App() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError("Could not load todos. Is the server running?");
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAdd = async (description) => {
    try {
      await createTodo(description);
      await loadTodos();
    } catch (err) {
      setError("Could not add todo. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>List of TODOs</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <TodoList todos={todos} />

      <h1>Create a ToDo</h1>
      <TodoForm onAdd={handleAdd} />
    </div>
  );
}

export default App;