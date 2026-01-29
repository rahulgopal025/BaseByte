import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Compiler from "./pages/Compiler";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ProblemDetails from "./pages/ProblemDetails";
import ProblemSolve from "./pages/ProblemSolve";

import ProfilePage from "./pages/ProfilePage";

import QuizPage from './pages/QuizPage';
import Topics from './pages/Topics';

import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";



export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Navbar />

        <main className="pt-16 min-h-screen bg-[#050505]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compiler" element={<Compiler />} />
            <Route path="/about" element={<About />} />
            
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />

            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:id" element={<ProblemDetails />} />
            <Route path="/solve/:id" element={<ProblemSolve />} />

            <Route path="/topics/:lang" element={<Topics />} />
            <Route path="/quiz/:lang/:topic" element={<QuizPage />} />

            <Route path="/profile" element={<ProfilePage />} />

            <Route path="*" element={<Home />} />


            
          </Routes>
        </main>

        <Footer />
      </ProfileProvider>
    </AuthProvider>
  );
}