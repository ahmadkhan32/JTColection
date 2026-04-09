import { AppRoutes } from './routes/AppRoutes';
import { CartDrawer } from './components/cart/CartDrawer';
// Footer is internally mapped inside the page blocks, so leaving it out of App root unless needed globally

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <AppRoutes />
      <CartDrawer />
    </div>
  );
}

export default App;
