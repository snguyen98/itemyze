import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';

import Home from './pages/Home';
import CreateExpense from './pages/CreateExpense';
import UploadReceipt from './pages/UploadReceipt';
import ItemiseExpense from './pages/ItemiseExpense';
import NotFound from './pages/NotFound';

//import './styles/index.scss';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/">
          <Route path="create" element={<CreateExpense />} />
          <Route path="upload" element={<UploadReceipt />} />
          <Route path="itemise" element={<ItemiseExpense />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
