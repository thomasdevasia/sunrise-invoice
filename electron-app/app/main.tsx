import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router"

import App from "./App"
import Home from "./routes/home"
import Invoices from "./routes/invoices"
import InvoicesNew from "./routes/invoices.new"
import InvoiceDetail from "./routes/invoices.$id"
import Company from "./routes/company"
import Clients from "./routes/clients"
import "./app.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />
          <Route path="invoices/new" element={<InvoicesNew />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="company" element={<Company />} />
          <Route path="clients" element={<Clients />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
