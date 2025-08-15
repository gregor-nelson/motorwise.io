import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PremiumReportPage from "./pages/Report/Premium";
import Home from "./pages/Home/Home";
import './styles/index.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add the new dynamic route that includes the registration parameter */}
        <Route path="/premium-report/:registration" element={<PremiumReportPage />} />

      </Routes>
    </Router>
  );
};

export default App;