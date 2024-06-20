import ReactModal from "react-modal";

import "@/pages/componentes/principal/style.css";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Coleira from "@/assets/icone/coleira.svg";
import User from "@/assets/icone/user.svg";
import Dna from "@/assets/icone/dna.svg";
import Telefone from "@/assets/icone/telefone.svg";
import Idade from "@/assets/icone/idade.svg";
import { ButtonBack } from "./buttons";

import close from "@/assets/icone/close.svg";
import "@/pages/componentes/modal/modal.css";
import axios from "axios";
import { toast } from "react-toastify";
const petsCreateSchema = z.object({
  namePet: z.string().min(1, "O nome do pet é obrigatório."),
  nameDono: z.string().min(1, "O nome do dono é obrigatório."),
  telefone: z.string(),
  animal: z.string().min(1, "O tipo de animal é obrigatório."),
  raca: z.string().min(1, "A raça é obrigatória."),
  data: z.string().min(1, "A data é obrigatória."),
});
const ModalCad = ({
  getPets,
  isOpen,
  onRequestClose,
  setOnEdit,
  pets,
  setPets,
  title,
  icons,
  button,
}) => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(petsCreateSchema),
  });
  async function handleCreate(dados) {
    await axios
      .post("http://localhost:8800/", dados)
      .then(({ data }) => {
        getPets();
        onRequestClose();
        toast.success(data);
      })
      .catch(({ data }) => toast.error(data));
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="overlay"
    >
      <div className="modal-container">
        <div className="titulo-close">
          <div className="titulo">
            {icons}
            <h2>{title}</h2>
          </div>
          <div onClick={onRequestClose} className="close">
            <Image src={close} alt="" />
          </div>
        </div>
        {/* form */}
        <form onSubmit={handleSubmit(handleCreate)} className="containerForm">
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
                  {...register("namePet")}
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
                  {...register("nameDono")}
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
                  {...register("telefone")}
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
                      {...register("animal")}
                      id="cachorro"
                      value="cachorro"
                      defaultChecked
                    />
                    <label htmlFor="cachorro">Cachorro</label>
                  </div>

                  <div className="divPet">
                    <input
                      type="radio"
                      {...register("animal")}
                      id="gato"
                      value="gato"
                    />
                    <label htmlFor="gato">Gato</label>
                  </div>
                </div>
              </div>
              <div className="campo">
                <span>
                  <Image src={Dna} alt="" />
                  Raça
                </span>
                <input
                  type="text"
                  placeholder="Raça"
                  {...register("raca")}
                ></input>
              </div>
              <div className="campo">
                <span>
                  <Image src={Idade} alt="" />
                  Nascimento <span className="spanExtra">(aproximado)</span>
                </span>
                <input
                  type="date"
                  placeholder="22/07/2020"
                  {...register("data")}
                ></input>
              </div>
            </div>
          </div>

          <div className="botoes">
            <ButtonBack close={onRequestClose} />
            {button}
          </div>
        </form>
      
      </div>
    </ReactModal>
  );
};
export default ModalCad;
