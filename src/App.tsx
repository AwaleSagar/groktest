import { BottomNav } from "@/components/BottomNav";
import { Budget } from "@/pages/Budget";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { SubscriptionForm } from "@/pages/SubscriptionForm";
import { Subscriptions } from "@/pages/Subscriptions";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscriptions/new" element={<SubscriptionForm />} />
            <Route path="/subscriptions/:id/edit" element={<SubscriptionForm />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}