import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    console.log(
      "Auth user changed:",
      user?.userId,
      user?.username,
      user?.signInDetails?.loginId
    );

    if (!user) {
      // no user = clear local state
      setTodos([]);
      return;
    }

    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        console.log("Todos from backend:", data.items);
        setTodos([...data.items]);
      },
      error: (err) => {
        console.error("observeQuery error", err);
      },
    });

    // unsubscribe whenever user changes or component unmounts
    return () => {
      console.log("Unsubscribing from todos");
      sub.unsubscribe();
    };
  }, [user]); // key change: depend on the whole user object

  function createTodo() {
    const content = window.prompt("Todo content");
    if (!content) return; // avoid empty todos

    client.models.Todo.create({ content });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>

      <button onClick={createTodo}>+ new</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
            {todo.content}
          </li>
        ))}
      </ul>

      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
