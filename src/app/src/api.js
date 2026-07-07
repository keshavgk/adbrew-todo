const API_BASE_URL = "http://localhost:8000";

export async function fetchTodos() {
  const response = await fetch(`${API_BASE_URL}/todos/`);
  if (!response.ok) {
    throw new Error("Failed to fetch todos.");
  }
  return response.json();
}

export async function createTodo(description) {
  const response = await fetch(`${API_BASE_URL}/todos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!response.ok) {
    throw new Error("Failed to create todo.");
  }
  return response.json();
}