import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { SelectedNodeProvider } from './context/SelectedNodeContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Flip, ToastContainer } from 'react-toastify'
import ModulesListPage from './pages/ModulesListPage'
import ModulePage from './pages/ModulePage'
import ConspectEditorPage from './pages/ConspectEditorPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <SelectedNodeProvider>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme="dark"
          transition={Flip}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ModulesListPage />} />
            <Route path="/modules/:moduleId" element={<ModulePage />} />
            <Route path="/editor/:id" element={<ConspectEditorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SelectedNodeProvider>
    </Provider>
  </StrictMode>
)
