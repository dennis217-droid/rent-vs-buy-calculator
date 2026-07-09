import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StateLandingPage from './pages/StateLandingPage';
import EmbedPage from './pages/EmbedPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="/:slug" element={<StateLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
