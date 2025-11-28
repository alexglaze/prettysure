import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import "./App.css";

import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import RatePage from "./pages/RatePage";
import AccountPage from "./pages/AccountPage";
import UpgradePage from "./pages/UpgradePage";

const client = generateClient<Schema>();

type Page = "home" | "rate" | "upgrade" | "account";

export default function App() {
  const { user } = useAuthenticator();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  /** --- KEEP YOUR DATA SUBSCRIPTION (Amplify works fine like this) --- */
  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos([...items]),
    });
    return () => sub.unsubscribe();
  }, []);

  /** --- SIMPLE PAGE RENDERER (NO ROUTER) --- */
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "rate":
        return <RatePage todos={todos} client={client} />;
      case "upgrade":
        return <UpgradePage />;
      case "account":
        return <AccountPage />;
      default:
        return <HomePage />;
    }
  };

  /** --- RENDER APP SHELL --- */
  return (
    <div className="app-shell">
      <NavBar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}

        userLabel={user?.signInDetails?.loginId || ""}
      />

      <main className="page-content">
        {renderPage()}
      </main>
    </div>
  );
}
