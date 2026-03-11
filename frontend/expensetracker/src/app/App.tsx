import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard, {
  DashboardOverview,
  DashboardTransactions,
  DashboardReports,
} from "./pages/Dashboard";
import Budget from "./pages/Budget";
import AddExpense from "./pages/AddExpense";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminOverview from "./pages/AdminOverview";
import AdminUsers from "./pages/AdminUsers";
import AdminAlerts from "./pages/AdminAlerts";
import AdminCategories from "./pages/AdminCategories";
import AdminLogs from "./pages/AdminLogs";
import AdminTransactions from "./pages/AdminTransactions";

export function App() {
  return (
    <>
      {/* 
        This is where the React router takes over.
        It decides which component to render based on the current URL.
      */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardOverview />} />
          <Route path="transactions" element={<DashboardTransactions />} />
          <Route path="reports" element={<DashboardReports />} />
        </Route>
        <Route path="/budget" element={<Budget />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>
      </Routes>
    </>
  );
}