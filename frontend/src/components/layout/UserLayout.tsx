import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UserLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background transition-colors duration-300">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
