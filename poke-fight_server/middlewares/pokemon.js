import { pokemon } from "../data/data.js";

export const checkPokemon = (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.sendStatus(404);
  if (isNaN(id)) return res.sendStatus(400);
  if (id > pokemon.length) return res.sendStatus(404);
  next();
};
