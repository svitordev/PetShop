import express from "express";
import {
  getPets,
  addPets,
  updatePets,
  deletePets,
} from "../controllers/pet.js";

const router = express.Router();

router.get("/", getPets);
router.post("/", addPets);
router.put("/:id", updatePets);
router.delete("/:id", deletePets);

export default router;
