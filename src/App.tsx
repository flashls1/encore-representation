import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/fx/SmoothScroll";
import MagneticCursor from "@/components/fx/MagneticCursor";
import PageTransition from "@/components/fx/PageTransition";
import Index from "./pages/Index";
import About from "./pages/About";
import TalentRoster from "./pages/TalentRoster";
import TalentProfile from "./pages/TalentProfile";
import BookingContact from "./pages/BookingContact";
import UpcomingEvents from "./pages/UpcomingEvents";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/roster" element={<PageTransition><TalentRoster /></PageTransition>} />
        <Route path="/talent/:id" element={<PageTransition><TalentProfile /></PageTransition>} />
        <Route path="/booking" element={<PageTransition><BookingContact /></PageTransition>} />
        <Route path="/events" element={<PageTransition><UpcomingEvents /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        {/* Redirects for old routes */}
        <Route path="/book" element={<Navigate to="/booking" replace />} />
        <Route path="/contact" element={<Navigate to="/booking" replace />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SmoothScroll>
              <MagneticCursor />
              <AnimatedRoutes />
            </SmoothScroll>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;