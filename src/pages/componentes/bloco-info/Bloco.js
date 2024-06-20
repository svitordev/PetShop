"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import "@/pages/componentes/bloco-info/bloco.css";

import Coleira from "@/assets/icone/coleira.svg";
import User from "@/assets/icone/user.svg";
import Dog from "@/assets/icone/cachorro.svg";
import Cat from "@/assets/icone/gato.svg";
import SetaCima from "@/assets/icone/seta-cima.svg";
import SetaBaixo from "@/assets/icone/seta-baixo.svg";
import Dna from "@/assets/icone/dna.svg";
import Telefone from "@/assets/icone/telefone.svg";
import Idade from "@/assets/icone/idade.svg";
import Editar from "@/assets/icone/editar.svg";
import Lixeira from "@/assets/icone/lixeira.svg";
import editarText from "@/assets/icone/text-editar.svg";

import ModalEdit from "@/pages/componentes/modal/ModalEdit.js";
import ModalDel from "../modal/ModalDel.js";
import {
  ButtonEdit,
  ButtonDelete,
  IconeDeletar,
  IconeEditar,
} from "@/pages/componentes/modal/buttons";

const blocoInfo = ({
  getPets,
  setPets,
  setOnEdit,
  pets,
  item,
  id,
  namePet,
  nameDono,
  telefone,
  animalD,
  raca,
  data,
}) => {
  
  const [selectedPet, setSelectedPet] = useState(null);

  const handleEdit = (item) => {
    setSelectedPet(item);
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  const [modalIsOpenDel, setModalIsOpenDel] = useState(false);
  const openModalDel = () => {
    setModalIsOpenDel(true);
  };

  const closeModalDel = () => {
    setModalIsOpenDel(false);
  };

  const infoPrincipalRef = useRef();
  const imagemSeta = useRef();
  const [ativo, setAtivo] = useState(false);

  const AnimalImage = ({ animal }) => {
    let srcAnimal;
    if (animal === "gato") {
      srcAnimal = Cat;
    } else if (animal === "cachorro") {
      srcAnimal = Dog;
    }
    return <Image src={srcAnimal} alt={animal} />;
  };

  const toggleBorda = () => {
    setAtivo(!ativo);
  };
  const [src, setSrc] = useState(SetaBaixo);
  const toggleSrc = () => {
    setSrc(src === SetaBaixo ? SetaCima : SetaBaixo);
  };

  const [mostrarMaisInfo, setMostrarMaisInfo] = useState({});

  const blocoInfo = `${id}-blocoInfo`;
  const maisInfo = `${id}-maisInfo`;

  function toggleMaisInfo(id) {
    setMostrarMaisInfo((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  }
  function handleClick(event) {
    toggleMaisInfo(id);
    toggleBorda();
    toggleSrc();
  }
  async function handleDelete(i) {
    await axios
      .delete("http://localhost:8800/" + i)
      .then(({ data }) => {
        
        toast.success(data);
      })
      .catch(({ data }) => toast.error(data));

    setOnEdit(null);
  }
  const whatssap = `https://wa.me/55${telefone}`;
  return (
    <div className="bloco-info" id={blocoInfo}>
      <div
        style={{
          border: ativo ? "3px solid dodgerblue" : "none",
          height: ativo ? "74px" : "80px",
        }}
        className="info-principal"
        ref={infoPrincipalRef}
        onClick={handleClick}
      >
        <div className="pet">
          <div className="circulo-pet">
            <AnimalImage animal={animalD} />
          </div>
        </div>
        <ul>
          <li>
            <Image src={Coleira} alt="" />
            {namePet}
          </li>
          <li>
            <Image src={User} alt="" />
            {nameDono}
          </li>
        </ul>
        <Image ref={imagemSeta} className="setaBaixo" src={src} alt="" />
      </div>
      {mostrarMaisInfo[id] && (
        <div className="maisInfo" id={maisInfo}>
          <div className="infosExtra">
            <span>
              <Image className="imgdna" src={Dna} alt="" />
              Raça: <br /> {raca}
            </span>
            <span>
              <Image src={Telefone} alt="" />
              Telefone: <br />
              <a href={whatssap} target="_blank" rel="noopener noreferrer">
                {telefone}
              </a>
            </span>
            <span>
              <Image src={Idade} alt="" />
              Nascimento: <br /> {data}
            </span>
          </div>
          <button
            onClick={() => {
              handleEdit( {namePet, nameDono, telefone, animalD, raca, data} );
              openModal();
            }}
            id="buttonEdit"
            className="buttonEdit"
          >
            <Image className="marginRight" src={Editar} alt="" />
            <Image src={editarText} alt="" />
          </button>
          {modalIsOpen && (
            <ModalEdit
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              getPets={getPets}
              setSelectedPet={setSelectedPet}
              selectedPet={selectedPet}
              item={item}
              title="Editar"
              icons={<IconeEditar />}
              button={<ButtonEdit />}
            ></ModalEdit>
          )}
          <button
            onClick={() => {
              handleEdit( {id, namePet, nameDono, telefone, animalD, raca, data} );
              openModalDel();
            }}
            id="buttonRemove"
            className="buttonRemove"
          >
            <Image className="marginRight" src={Lixeira} alt="" />
            Remover
          </button>
          {modalIsOpenDel && (
            <ModalDel
              isOpen={modalIsOpenDel}
              onRequestClose={closeModalDel}
              selectedPet={selectedPet}
              title="Deletar"
              icons={<IconeDeletar />}
              button={<ButtonDelete click={handleDelete} id={id} />}
            ></ModalDel>
          )}
        </div>
      )}
    </div>
  );
};
export default blocoInfo;
