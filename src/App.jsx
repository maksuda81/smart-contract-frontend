import { useState } from "react";
import "./App.css";
import Blockchain from "./blockchain/Blockchain";
import Footer from "./components/footer";

function App() {
  return (
    <>
      <Blockchain />
      <Footer />
    </>
  );
}

export default App;
