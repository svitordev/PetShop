import { db } from "../db.js";

export const getPets = (req, res) => {
  const searchTerm = req.query.search;
  const q = searchTerm
    ? `SELECT * FROM pets WHERE namePet LIKE '%${searchTerm}%' OR nameDono LIKE '%${searchTerm}%' ORDER BY namePet;`
    : "SELECT * FROM pets ORDER BY namePet";

  db.query(q, (err, data) => {
    if (err) return res.json(err);

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
    if (err) return res.json(err);
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

  db.query(q, [...values, req.params.id], (err) => {
    if (err) return res.json(err);
    return res.status(200).json("Pet atualizado com sucesso.");
  });
};

export const deletePets = (req, res) => {
  const q = "DELETE FROM pets WHERE `id` = ?";

  db.query(q, [req.params.id], (err) => {
    if (err) return res.json(err);
    return res.status(200).json("Pet deletado com sucesso.");
  });
};
