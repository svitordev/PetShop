import textVoltar from "@/assets/icone/Voltar.svg";
import iconVoltar from "@/assets/icone/iconvoltar.svg";
import MaisCadastrar from "@/assets/icone/+.svg";
import Editar from "@/assets/icone/editarBranco.svg";
import Lixeira from "@/assets/icone/lixeira.svg";

import Image from "next/image";
import "@/components/modal/button.css";

export function ButtonBack({ close }) {
  return (
    <button onClick={close} className="buttonBack">
      <Image className="mais" src={iconVoltar} alt="" />
      <Image src={textVoltar} alt="" />
    </button>
  );
}
export function ButtonSave() {
  return (
    <button type="submit" name="submit" className="buttonSalvar">
      <Image className="mais" src={MaisCadastrar} alt="" />
      Cadastrar
    </button>
  );
}
export function ButtonEdit({ handleEdit }) {
  return (
    <button
      onClick={handleEdit}
      type="submit"
      name="submit"
      className="buttonSalvar"
    >
      <Image className="mais" src={Editar} alt="" />
      Editar
    </button>
  );
}
export function ButtonDelete({ click, id }) {
  return (
    <button
      onClick={() => click(id)}
      type="button"
      name="submit"
      className="buttonDelete"
    >
      <Image className="mais" src={Lixeira} alt="" />
      Remover
    </button>
  );
}
export function IconeCadastro() {
  return (
    <div className="circulo">
      <Image className="icon" src={MaisCadastrar} alt="" />
    </div>
  );
}
export function IconeEditar() {
  return (
    <div className="circulo">
      <Image className="icon" src={Editar} alt="" />
    </div>
  );
}
export function IconeDeletar() {
  return (
    <div className="circulo">
      <Image className="icon" src={Lixeira} alt="" />
    </div>
  );
}
