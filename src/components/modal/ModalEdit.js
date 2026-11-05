import { useForm } from "react-hook-form";
import { z } from "zod";
import "@/components/principal/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import ReactModal from "react-modal";
import Image from "next/image";
import Coleira from "@/assets/icone/coleira.svg";
import User from "@/assets/icone/user.svg";
import Dna from "@/assets/icone/dna.svg";
import Telefone from "@/assets/icone/telefone.svg";
import Idade from "@/assets/icone/idade.svg";
import "@/components/modal/modal.css";
import { ButtonBack } from "./buttons";

import close from "@/assets/icone/close.svg";
const petsCreateSchema = z.object({
  namePet: z.string().min(1, "O nome do pet é obrigatório."),
  nameDono: z.string().min(1, "O nome do dono é obrigatório."),
  telefone: z.string(),
  animal: z.string().min(1, "O tipo de animal é obrigatório."),
  raca: z.string().min(1, "A raça é obrigatória."),
  data: z.string().min(1, "A data é obrigatória."),
});

const ModalEdit = ({
  isOpen,
  onRequestClose,
  title,
  icons,
  setSelectedPet,
  selectedPet,
  button,
  item,
  getPets,
}) => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(petsCreateSchema),
  });
  async function handleUpdate(dados) {
    await axios
      .put("http://localhost:8800/" + item.id, dados)
      .then(({ data }) => {
        getPets();
        onRequestClose();
        toast.success(data);
      })
      .catch(() => toast.error("Não foi possível atualizar o pet. Tente novamente."));
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
        <form onSubmit={handleSubmit(handleUpdate)} className="containerForm">
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
                  value={selectedPet?.namePet || ""}
                  onChange={(e) =>
                    setSelectedPet({ ...selectedPet, namePet: e.target.value })
                  }
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
                  value={selectedPet?.nameDono || ""}
                  onChange={(e) =>
                    setSelectedPet({ ...selectedPet, nameDono: e.target.value })
                  }
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
                  value={selectedPet?.telefone || ""}
                  onChange={(e) =>
                    setSelectedPet({ ...selectedPet, telefone: e.target.value })
                  }
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
                      checked={selectedPet?.animalD === "cachorro"}
                      onChange={(e) =>
                        setSelectedPet({
                          ...selectedPet,
                          animalD: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="cachorro">Cachorro</label>
                  </div>

                  <div className="divPet">
                    <input
                      type="radio"
                      {...register("animal")}
                      id="gato"
                      value="gato"
                      checked={selectedPet?.animalD === "gato"}
                      onChange={(e) =>
                        setSelectedPet({
                          ...selectedPet,
                          animalD: e.target.value,
                        })
                      }
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
                  value={selectedPet?.raca || ""}
                  onChange={(e) =>
                    setSelectedPet({ ...selectedPet, raca: e.target.value })
                  }
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
                  value={selectedPet?.data || ""}
                  onChange={(e) =>
                    setSelectedPet({ ...selectedPet, data: e.target.value })
                  }
                ></input>
              </div>
            </div>
          </div>

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
export default ModalEdit;
