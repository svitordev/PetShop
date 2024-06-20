"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Lupa from "@/assets/icone/lupa.svg";

const petsFiltersSchema = z.object({
  name: z.string(),
});

export function SearchFilter({handleSearch}) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(petsFiltersSchema),
  });

  function handleFilter(data) {
    handleSearch(data.name);
  }

  return (
    <form onSubmit={handleSubmit(handleFilter)} className="search">
      <div className="lupa">
        <Image className="Imagem" src={Lupa} alt="" />
      </div>
      <input
        className="inputSearch"
        type="text"
        placeholder="Digite o nome do pet ou dono"
        {...register("name")}
      ></input>

      <button className="buttonSubmit" name="submit" type="submit">
        {" "}
        Pesquisar
      </button>
    </form>
  );
}
