import axios from "axios";
import { pokemon } from "../data/data.js";
import POKE_API from "../constants/pokemon.js";

const getAllPokeNames = async (url) => {
  const response = await axios.get(url);
  return response.data.names;
};

export const getPokemons = async (req, res) => {
  const { offset, limit } = req.query;

  try {
    const response = await axios.get(
      `${POKE_API}?offset=${offset}&limit=${limit}`
    );
    const { results } = response.data;
    const arrayOfPromises = results.map((poke) => {
      return axios.get(poke.url);
    });

    const arrayOfPokemons = await Promise.all(arrayOfPromises);

    const pokemonsWithNames = arrayOfPokemons.map(async (poke) => {
      const allNames = await getAllPokeNames(poke.data.species.url);
      return {
        id: poke.data.id,
        name: {
          en: poke.data.name.slice(0, 1).toUpperCase() + poke.data.name.slice(1),
          other: allNames,
        },
        type: poke.data.types.map((type) => type.type.name),
        base: {
          hp: poke.data.stats[0].base_stat,
          attack: poke.data.stats[1].base_stat,
          defense: poke.data.stats[2].base_stat,
          special_attack: poke.data.stats[3].base_stat,
          special_defense: poke.data.stats[4].base_stat,
          speed: poke.data.stats[5].base_stat,
        },
        sprites: poke.data.sprites,
      };
    });

    const pokemons = await Promise.all(pokemonsWithNames);

    res.json(pokemons);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const getPokemon = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${POKE_API}/${id}/`);
    const poke = response;
    const pokemon = {
      id: poke.data.id,
      name: {
        en: poke.data.name.slice(0, 1).toUpperCase() + poke.data.name.slice(1),
        other: "allNames",
      },
      type: poke.data.types.map((type) => type.type.name),
      base: {
        hp: poke.data.stats[0].base_stat,
        attack: poke.data.stats[1].base_stat,
        defense: poke.data.stats[2].base_stat,
        special_attack: poke.data.stats[3].base_stat,
        special_defense: poke.data.stats[4].base_stat,
        speed: poke.data.stats[5].base_stat,
      },
      sprites: poke.data.sprites,
    };

    res.json(pokemon);
    console.log("Fetching pokemon from API", response.data.name);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const getPokemonInfo = (req, res) => {
  const { id, info } = req.params;
  if (!info) return res.sendStatus(404);
  if (info !== "name" || info !== "type" || info !== "base")
    return sendStatus(404);
  const pokemonInfo = pokemon.find((poke) => poke.id === Number(id));
  res.json(pokemonInfo[info]);
};
