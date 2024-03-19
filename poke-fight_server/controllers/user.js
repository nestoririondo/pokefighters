import User from "../models/User.js";

export const getUser = async (req, res) => {
  const { username, password } = req.query;
  console.log(username, password);
  try {
    const user = await User.findOne({ username: username });
    !user
      ? res.status(404).json({ message: "User not found." })
      : user.password !== password
      ? res.status(401).json({ message: "Wrong password." })
      : res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const data = await User.find().sort({ pokemons: -1 }).limit(10);
    const users = data.map((user) => {
      return {
        id: user._id,
        username: user.username,
        pokemons: user.pokemons,
        seen: user.seen,
      };
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postUser = async (req, res) => {
  try {
    const data = await User.create(req.newUser);
    res
      .status(201)
      .json({ data, message: "User created. You may log in now." });
    console.log("User created", data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const putUser = async (req, res) => {
  const { id } = req.params;
  const { seenPokemonId, newPokemonId, team, battle } = req.body;
  try {
    let update = {};
    if (newPokemonId) {
      update = { $addToSet: { pokemons: newPokemonId } };
    }
    if (team) {
      update = { $set: { team: team } };
    }
    if (seenPokemonId) {
      update = { $addToSet: { seen: seenPokemonId } };
    }
    if (battle) {
      update = { $addToSet: { battles: battle } };
      console.log("battle update", battle, update);
    }
    const data = await User.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
