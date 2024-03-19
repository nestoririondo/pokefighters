import User from "../models/User.js";

export const checkUser = (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(404).json({ message: "User not found." });
  next();
};

export const checkData = async (req, res, next) => {
  const { username, password, pokemonId } = req.body;

  if (!username || typeof username !== "string")
    return res.status(400).json({ message: "Username required." });
  if (!password || typeof password !== "string")
    return res.status(400).json({ message: "Password required." });
  if (!pokemonId || typeof pokemonId !== "number")
    return res.status(400).json({ message: "Starting Pokemon required." });

  try {
    const user = await User.findOne({ username: username });
    if (user)
      return res.status(400).json({ message: "Username already taken." });

    const newUser = { username, password, pokemons: [pokemonId] };
    req.newUser = newUser;
    next();
  } catch (error) {
    return res.status(500).json({ message: "An error occurred." });
  }
};
