import ReactModal from "react-modal";
import "@/pages/componentes/principal/style.css";
import Image from "next/image";
import Coleira from "@/assets/icone/coleira.svg";
import User from "@/assets/icone/user.svg";
import Dna from "@/assets/icone/dna.svg";
import Telefone from "@/assets/icone/telefone.svg";
import Idade from "@/assets/icone/idade.svg";
import { ButtonBack, ButtonDelete } from "./buttons";

import close from "@/assets/icone/close.svg";
import "@/pages/componentes/modal/modal.css";

const ModalDel = ({
  isOpen,
  onRequestClose,
  title,
  selectedPet,
  icons,
  button,
}) => {
  console.log(selectedPet);
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
        <form className="containerForm">
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
                  value={selectedPet?.namePet}
                  disabled
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
                  value={selectedPet?.nameDono}
                  disabled
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
                  value={selectedPet?.telefone}
                  disabled
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
                      id="cachorro"
                      value="cachorro"
                      checked={selectedPet?.animalD === "cachorro"}
                      disabled
                    />
                    <label htmlFor="cachorro">Cachorro</label>
                  </div>

                  <div className="divPet">
                    <input
                      type="radio"
                      id="gato"
                      value="gato"
                      checked={selectedPet?.animalD === "gato"}
                      disabled
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
                  value={selectedPet?.raca}
                  disabled
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
                  value={selectedPet?.data}
                  disabled
                ></input>
              </div>
            </div>
          </div>
          <p>Tem certeza que deseja remover esse pet? </p>

          <div className="botoes">
            <ButtonBack close={onRequestClose} />
            {button}
          </div>
        </form>
        {/* form */}
      </div>
    </ReactModal>
  );
};
export default ModalDel;
