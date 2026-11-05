import { db } from "../db.js";

// SEC-002: erro do banco → status de erro + JSON genérico fixo.
// Nenhum detalhe do erro (message, sql, sqlMessage, code, errno, stack...)
// vai para o cliente, e o conteúdo da resposta não depende do erro recebido.
function erroOperacao(res) {
  return res.status(500).json({ error: "Não foi possível concluir a operação." });
}

export const getPets = (req, res) => {
  const searchTerm = req.query.search;

  // SEC-001: o valor do usuário nunca entra na string SQL — viaja separado,
  // como valor. A proteção vem da separação SQL × valores, não de sanitização.
  // undefined = ausência do parâmetro (lista completa); os demais tipos
  // não textuais são rejeitados ANTES de tocar o banco.
  if (searchTerm !== undefined && typeof searchTerm !== "string") {
    return res
      .status(400)
      .json({ error: "Parâmetro 'search' deve ser um texto." });
  }

  const q = searchTerm
    ? "SELECT * FROM pets WHERE namePet LIKE ? OR nameDono LIKE ? ORDER BY namePet;"
    : "SELECT * FROM pets ORDER BY namePet";

  // Os % são adicionados pela aplicação ao redor do valor — o LIKE continua
  // funcionando sem interpolar o dado na sintaxe.
  const values = searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`] : undefined;

  db.query(q, values, (err, data) => {
    if (err) return erroOperacao(res);

    return res.status(200).json(data);
  });
};

export const addPets = (req, res) => {
  const q =
    "INSERT INTO  pets(`namePet`, `nameDono`, `telefone`, `animal`, `raca`, `data`) VALUES(?)";

  const values = [
    req.body.namePet,
    req.body.nameDono,
    req.body.telefone,
    req.body.animal,
    req.body.raca,
    req.body.data,
  ];

  db.query(q, [values], (err) => {
    if (err) return erroOperacao(res);
    return res.status(200).json("Pet criado com sucesso.");
  });
};

export const updatePets = (req, res) => {
  const q =
    "UPDATE pets SET `namePet` = ?, `nameDono` = ? , `telefone` = ?, `animal` = ?, `raca` = ?, `data` = ? WHERE `id` = ?";

  const values = [
    req.body.namePet,
    req.body.nameDono,
    req.body.telefone,
    req.body.animal,
    req.body.raca,
    req.body.data,
  ];

  db.query(q, [...values, req.params.id], (err, result) => {
    if (err) return erroOperacao(res);

    // QLT-001: nenhuma linha afetada = nenhum registro correspondeu ao id.
    // O critério é affectedRows; changedRows não decide existência (mesmos
    // valores em registro existente continuam sendo atualização válida).
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet não encontrado." });
    }

    return res.status(200).json("Pet atualizado com sucesso.");
  });
};

export const deletePets = (req, res) => {
  const q = "DELETE FROM pets WHERE `id` = ?";

  db.query(q, [req.params.id], (err, result) => {
    if (err) return erroOperacao(res);

    // QLT-001: nenhuma linha afetada = nenhum registro correspondeu ao id.
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet não encontrado." });
    }

    return res.status(200).json("Pet deletado com sucesso.");
  });
};
