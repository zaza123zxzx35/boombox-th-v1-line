import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AssetLibrary from "./pages/AssetLibrary";
import AdminProducts from "./pages/AdminProducts";
import Home from "./pages/Home";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" position="top-center" />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/admin/assets" component={AssetLibrary} />
            <Route path="/admin/products" component={AdminProducts} />
            <Route component={Home} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
