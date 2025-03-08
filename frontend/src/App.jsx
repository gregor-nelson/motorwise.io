import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PremiumReportPage from "./pages/Report/Premium";
import Home from "./pages/Home/Home";

const App = () => {
  return (
 
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Report" element={<PremiumReportPage />} />
        </Routes>
      </Router>
    
  );
};

export default App;