import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("invoices/new", "routes/invoices.new.tsx"),
  route("invoices/:id", "routes/invoices.$id.tsx"),
  route("invoices", "routes/invoices.tsx"),
  route("company", "routes/company.tsx"),
  route("clients", "routes/clients.tsx"),
] satisfies RouteConfig
