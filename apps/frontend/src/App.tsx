import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/Global.css';
import Home from './pages/Home.tsx';
import Folder from './pages/Folder.tsx';
import FolderDetail from './pages/FolderDetail.tsx';
import Account from './pages/Account.tsx';
import Study from './pages/Study.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/folder"
            element={
              <ProtectedRoute>
                <Folder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/folders/:folderId"
            element={
              <ProtectedRoute>
                <FolderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study/:deckId"
            element={
              <ProtectedRoute>
                <Study />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
