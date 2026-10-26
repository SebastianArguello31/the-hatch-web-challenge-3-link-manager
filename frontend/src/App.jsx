import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LinkDetailPage from "./pages/LinkDetailPage.jsx";

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">Director de Enlaces</Link>

        <p>Un lugar para organizar los recursos de internet.</p>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/links/:id" element={<LinkDetailPage />}/>

          <Route
            path="*"
            element={
              <section>
                <h1>Página no encontrada</h1>
                <Link to="/">Volver al listado</Link>
              </section>
            }
          />
        </Routes>
      </main>
    </>
  );
}