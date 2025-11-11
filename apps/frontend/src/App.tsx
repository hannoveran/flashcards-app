import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/Global.css';
import Home from './pages/Home.tsx';
import Folder from './pages/Folder.tsx';
import Account from './pages/Account.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/folder" element={<Folder />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
