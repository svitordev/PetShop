"use client"
import react, {useRef, useEffect} from "react";
import Coleira from "@/assets/icone/coleira.svg";
import User from "@/assets/icone/user.svg";
import Dna from "@/assets/icone/dna.svg";
import Telefone from "@/assets/icone/telefone.svg";
import Idade from "@/assets/icone/idade.svg";
import Image from "next/image";
import {
  ButtonBack,
  ButtonSave,
  ButtonEdit,
  ButtonDelete,
  IconeCadastro,
  IconeDeletar,
  IconeEditar,
} from "./modal/buttons";



export function Form({
  setOnEdit,
  onEdit,
  button,
  getPets,
}) 
{
  const form = useRef();
  useEffect(() => {
    if (onEdit) {
      const pet = form.current;

      pet.namePet.value = onEdit.namePet;
      pet.nameDono.value = onEdit.nameDono;
      pet.telefone.value = onEdit.telefone;
      pet.animal.value = onEdit.animal;
      pet.raca.value = onEdit.raca;
      pet.data.value = onEdit.data;
    }
  }, [onEdit]);
  async function handleSubmit(e) {
    e.preventDefault();

    const pet = form.current;
    if (
      !pet.namePet.value ||
      !pet.nameDono.value ||
      !pet.telefone.value ||
      !pet.animal.value ||
      !pet.raca.value ||
      !pet.data.value
    ) {
      return toast.warn("Preencha todos os campos!");
    }
    if (onEdit) {
      await axios
        .put("http://localhost:8800/" + onEdit.id, {
          namePet: pet.namePet.value,
          nameDono: pet.nameDono.value,
          telefone: pet.telefone.value,
          animal: pet.animal.value,
          raca: pet.raca.value,
          data: pet.data.value,
        })
        .then(({ data }) => toast.success(data))
        .catch(({ data }) => toast.error(data));
    }
  }

  return (
    <form ref={form} onSubmit={handleSubmit(handleCreate)} className="containerForm">
      <div className="containerInfos">
        <div className="blocoInfos">
        <div className="campo">
                <span>
                  <Image src={Coleira} alt="" />
                  Nome
                </span>
                <input
                  type="text"
                  placeholder="Nome Sobrenome"
                  name="namePet"
                ></input>
              </div>
              <div className="campo">
                <span>
                  <Image src={User} alt="" />
                  Dono
                </span>
                <input
                  type="text"
                  placeholder="Nome Sobrenome"
                  name="nameDono"
                ></input>
              </div>
              <div className="campo">
                <span>
                  <Image src={Telefone} alt="" />
                  Telefone
                </span>
                <input
                  type="text"
                  placeholder="(00) 0 0000-0000"
                  name="telefone"
                ></input>
              </div>
            </div>
            <div className="blocoInfos">
              <div className="campo">
                <span>
                  <Image src={Dna} alt="" />
                  Animal
                </span>
                <div className="divOptions">
                  <div className="divPet">
                    <input
                      type="radio"
                      name="animal"
                      id="cachorro"
                      value="cachorro"
                      defaultChecked
                    />
                    <label htmlFor="cachorro">Cachorro</label>
                  </div>

                  <div className="divPet">
                    <input type="radio" name="animal" id="gato" value="gato" />
                    <label htmlFor="gato">Gato</label>
                  </div>
                </div>
              </div>
              <div className="campo">
                <span>
                  <Image src={Dna} alt="" />
                  Raça
                </span>
                <input type="text" placeholder="Raça" name="raca"></input>
              </div>
              <div className="campo">
                <span>
                  <Image src={Idade} alt="" />
                  Nascimento <span className="spanExtra">(aproximado)</span>
                </span>
                <input type="date" placeholder="22/07/2020" name="data"></input>
              </div>
            </div>
          </div>

      <div className="botoes">
        <ButtonBack close={onRequestClose} />
        {button}
      </div>
    </form>
  );
}
