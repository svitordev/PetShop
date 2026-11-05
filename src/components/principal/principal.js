"use client";
import axios from "axios";
import { toast } from "react-toastify";
import React, { useState, useRef } from "react";
import "@/components/principal/style.css";
import "@/components/modal/modal.css";
import Image from "next/image";
import BlocoInfo from "../bloco-info/Bloco";
import ModalCad from "@/components/modal/ModalCad";

import Logo from "@/assets/icone/logo.svg";
import MaisCadastrar from "@/assets/icone/+.svg";

import {
  ButtonSave,
  ButtonEdit,
  ButtonDelete,
  IconeCadastro,
  IconeDeletar,
  IconeEditar,
} from "../modal/buttons";
import { SearchFilter } from "../SearchFilter";

const principal = ({ getPets, pets, setPets, setOnEdit }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  
  const handleSearch = async (searchTerm) => {
    try {
      const res = await axios.get(`http://localhost:8800?search=${searchTerm}`);
      setPets(res.data);
      toast.success(`${searchTerm} encontrado!`);
    } catch {
      toast.error("Não foi possível pesquisar os pets. Tente novamente.");
    }
  };

  return (
    <div className="container">
      <div className="painel">
        <div className="logo">
          <Image src={Logo} alt="" />
        </div>
        <section className="search-cadastro">
          <SearchFilter handleSearch={handleSearch} />
          <button onClick={openModal} className="cadastrar">
            <Image className="Imagem" src={MaisCadastrar} alt="" />
            Cadastrar
          </button>
          {modalIsOpen && (
            <ModalCad
              getPets={getPets}
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              setOnEdit={setOnEdit}
              pets={pets}
              setPets={setPets}
              title="Cadastrar"
              icons={<IconeCadastro />}
              button={<ButtonSave />}
            ></ModalCad>
          )}
        </section>
        <section className="lista" id="listaId">
          {pets.map((item, id) => (
            <BlocoInfo
              getPets={getPets}
              setOnEdit={setOnEdit}
              pets={pets}
              setPets={setPets}
              item={item}
              id={item.id}
              namePet={item.namePet}
              nameDono={item.nameDono}
              telefone={item.telefone}
              animalD={item.animal}
              raca={item.raca}
              data={item.data}
            />
          ))}
        </section>
      </div>
    </div>
  );
};
export default principal;
