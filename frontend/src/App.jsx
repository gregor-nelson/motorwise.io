import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PremiumReportPage from "./pages/Report/Premium";
import Home from "./pages/Home/Home";
import Cookies from "./pages/Legal/Cookies";
import Contact from "./pages/Legal/Contact";
import Terms from "./pages/Legal/Terms";
import Accessibility from "./pages/Legal/Accessibility";
import Privacy from "./pages/Legal/Privacy";
import './styles/index.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add the new dynamic route that includes the registration parameter */}
        <Route path="/premium-report/:registration" element={<PremiumReportPage />} />
        
        {/* Legal pages */}
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/privacy" element={<Privacy />} />

      </Routes>
    </Router>
  );
};

export default App;