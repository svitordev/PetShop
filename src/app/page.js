"use client";
import "@/app/globals.css";
import "./page.module.css";
import Principal from "@/components/principal/principal.js";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from 'styled-components';

import axios from "axios";

import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  weight: ["400", "700"],
  subsets: ["latin"],
});
const StyledContainer = styled(ToastContainer)`
  // https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
  &&&.Toastify__toast-container {
  }
  .Toastify__toast--success {
  background-image: var(--background-toast); /* Cor de fundo para toasts de sucesso */
  color: #fff;
}

.Toastify__toast--error {
  background-image: var(--background-toast); /* Cor de fundo para toasts de sucesso */
  color: #fff;
  }
  .Toastify__progress-bar--error {
  background-color: red; /* Sua cor desejada */
}
.Toastify__close-button {
  color: #fff; /* Sua cor desejada */
}
`;
export default function Home() {
  const [pets, setPets] = useState([]);
  const [onEdit, setOnEdit] = useState(null);

  const getPets = async () => {
    try {
      const res = await axios.get("http://localhost:8800");
      setPets(res.data.sort((a, b) => (a.nome > b.nome ? -1 : 1)));
    } catch {
      toast.error("Não foi possível carregar os pets. Tente novamente.");
    }
  };

  useEffect(() => {
    getPets();
  }, [setPets]);

  return (
    <main className={ubuntu.className}>
      <Principal
        getPets={getPets}
        pets={pets}
        setPets={setPets}
        setOnEdit={setOnEdit}
        onEdit={onEdit}
      />
      <StyledContainer
        position="bottom-right"
        autoClose={1500}
        limit={3}
        closeOnClick
        pausaOnFocusLoss
        pauseOnHover={false}
        newestOnTop
        
      />
    </main>
  );
}
