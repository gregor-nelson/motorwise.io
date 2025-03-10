import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PremiumReportPage from "./pages/Report/Premium";
import Home from "./pages/Home/Home";
import './styles/index.css'
import VehicleInfo from "./pages/Test";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add the new dynamic route that includes the registration parameter */}
        <Route path="/premium-report/:registration" element={<PremiumReportPage />} />
        <Route path="/test" element={<VehicleInfo />} />

      </Routes>
    </Router>
  );
};

export default App;