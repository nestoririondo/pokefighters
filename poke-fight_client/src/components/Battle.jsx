import { useState, useEffect, useContext } from "react";
import "../styles/Battle.css";
import "../styles/Pokeball.css";
import { PokemonContext } from "../provider/PokemonProvider";

const Battle = () => {

  const SERVER = import.meta.env.VITE_SERVER
  // for User
  const { user, setUser } = useContext(PokemonContext);
  //for Pokemon stats
  const [myPokemonId, setMyPokemonId] = useState();
  const [myPokemon, setMyPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [myHp, setMyHp] = useState(null);
  const [opponentHp, setOpponentHp] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  //for game status
  const [loading, setLoading] = useState(true);
  const [battleStatus, setBattleStatus] = useState("inactive");
  const [fightEnabled, setFightEnabled] = useState(true);
  const [trainerAttack, setTrainerAttack] = useState(true);
  const [newOpponent, setNewOpponent] = useState(true);
  const [specialAttackUsed, setSpecialAttackUsed] = useState(false);
  // for battle animations
  const [fightText, setFightText] = useState("");
  const [opponentHpRate, setOpponentHpRate] = useState(100);
  const [trainerHpRate, setTrainerHpRate] = useState(100);
  const [vibrate, setVibrate] = useState(false);
  const [vibrateOpponent, setVibrateOpponent] = useState(false);

  const randomNumber = (max) => Math.floor(Math.random() * max) + 1;

  // FETCHING PKMN DATA FROM API
  const getMyPokemon = async (myPokemonId) => {
    try {
      const res = await fetch(`${SERVER}/pokemon/${myPokemonId}`);
      // const res = await fetch(`${SERVER}/pokemon/150`);
      const data = await res.json();
      setMyPokemon(data);
      setMyHp(data.base.hp);
      setBattleStatus("active");
      setFightEnabled(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getOpponentPokemon = async () => {
    try {
      const res = await fetch(`${SERVER}/pokemon/${randomNumber(150)}`);
      const data = await res.json();
      setOpponentPokemon(data);
      setOpponentHp(data.base.hp);
      setOpponentId(data.id);
      if (battleStatus !== "catching") {
        setBattleStatus("active");
        setFightEnabled(true);
      }
      // console.log("Opponent Pokemon", data);
    } catch (error) {
      console.log(error);
    }
  };

  // STORE POKEMON ENCOUNTERED AND FOUGHT IN DATABASE
  const encounterPokemon = async () => {
    try {
      const response = await fetch(`${SERVER}/user/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seenPokemonId: opponentId }),
      });
      // Update user global state
      setUser((prev) => {
        return prev.seen.includes(opponentId)
          ? prev
          : { ...prev, seen: [...prev.seen, opponentId] };
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const catchPokemon = async () => {
    try {
      const response = await fetch(`${SERVER}/user/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPokemonId: opponentId }),
      });
      // Update user global state
      setUser((prev) => {
        return prev.pokemons.includes(opponentId)
          ? prev
          : { ...prev, pokemons: [...prev.pokemons, opponentId] };
      });
      setFightText("Pokémon caught!");
    } catch (error) {
      console.log(error.message);
    }
  };

  const sendBattleResult = async (result) => {
    const battle = {
      mypokemon: {
        id: myPokemon.id,
        name: myPokemon.name.en,
        img: myPokemon.sprites.front_default,
      },
      result: result,
      opponent: {
        id: opponentPokemon.id,
        name: opponentPokemon.name.en,
        img: opponentPokemon.sprites.front_default,
      },
      date: new Date(),
    };
    console.log("hello from battle result", battle);
    try {
      const response = fetch(`${SERVER}/user/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battle: battle }),
      });
      setUser((prev) => {
        return { ...prev, battles: [...prev.battles, battle] };
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    setLoading(false);
    setBattleStatus("inactive");
  }, []);

  useEffect(() => {
    encounterPokemon();
  }, [opponentId]);

  useEffect(() => {
    {
      myPokemonId > 0 ? getMyPokemon(myPokemonId) : null;
    }
    {
      myPokemonId > 0 ? getOpponentPokemon() : null;
    }
    {
      myPokemonId > 0 ? setBattleStatus("active") : setBattleStatus("inactive");
    }
  }, [myPokemonId]);

  // CONTOLLING FIGHT STATUS
  useEffect(() => {
    let timeout;
    if (myHp !== null && myHp <= 0) {
      setFightText("FOE defeated TRAINER. TRAINER faints");
      const newMyHp = (myHp / myPokemon.base.hp) * 100; // last hp rate
      setTrainerHpRate(newMyHp);
      sendBattleResult("lose"); // send result to server
      setFightEnabled(false);
      timeout = setTimeout(() => {
        setBattleStatus("inactive");
      }, 5000);
    }
    if (opponentHp !== null && opponentHp <= 0) {
      if (newOpponent) {
        const newOpponentHpRate = (opponentHp / opponentPokemon.base.hp) * 100; // last hp rate
        setOpponentHpRate(newOpponentHpRate);
        setBattleStatus("catching");
        setNewOpponent(false);
      } else {
        timeout = setTimeout(() => {
          setBattleStatus("inactive");
        }, 5000);
      }
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [myHp, opponentHp, newOpponent]);

  useEffect(() => {
    let timeout;
    if (battleStatus === "catching") {
      setFightText("TRAINER defeats FOE. TRAINER wins!");
      sendBattleResult("win"); // send result to server
      setSpecialAttackUsed(false);
      setVibrate(false);
      setVibrateOpponent(false);
      timeout = setTimeout(() => {
        catchPokemon();
      }, 2500);
      timeout = setTimeout(() => {
        setBattleStatus("inactive");
        setMyPokemonId(0);
      }, 5000);
    }
    if (battleStatus === "inactive") {
      setMyPokemonId(0);
      setSpecialAttackUsed(false);
      setVibrate(false);
      setVibrateOpponent(false);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [battleStatus]);

  // CONTROLLING START OF NEW ROUND
  useEffect(() => {
    let text;
    opponentPokemon
      ? (text = `A wild ${opponentPokemon.name.en.toUpperCase()} appeared!`)
      : null;
    setFightText(text);
    setOpponentHpRate(100);
  }, [opponentPokemon]);

  useEffect(() => {
    setTrainerHpRate(100);
  }, [myPokemon]);

  // CALCULATING DAMAGE
  const calculateDamage = (attacker, defender, special) => {
    let damage;
    if (special === "special" && specialAttackUsed === false) {
      damage = Math.floor(
        (20 + attacker.base.special_attack - defender.base.special_defense) /
          (Math.random() * 2 + 1)
      );
      setSpecialAttackUsed(true);
    } else {
      damage = Math.floor(
        (20 + attacker.base.attack - defender.base.defense) /
          (Math.random() * 2 + 1)
      );
    }
    damage <= 5 ? (damage = Math.floor(Math.random() * 4) + 1) : damage;
    return damage;
  };

  // SINGE FIGHT ROUND LOGIC
  const startFight = (special = null) => {
    // My turn
    setFightEnabled(false);
    setNewOpponent(true);
    let myDamage = calculateDamage(myPokemon, opponentPokemon, special);
    let trainerText = "You inflict " + myDamage + " DAMAGE";

    // 5% chance of critical hit and double damage and 5% chance of miss and 0 damage
    const critical = Math.random();
    const miss = Math.random();
    if (critical < 0.05) {
      myDamage = myDamage * 2;
      trainerText = "Critical Hit! You inflict " + myDamage + " DAMAGE";
    }
    if (miss < 0.05) {
      myDamage = 0;
      trainerText = "You miss!";
    } else {
      setVibrateOpponent(true); // vibrate animation 
      setTimeout(() => {
        setVibrateOpponent(false);
      }, 800);
    }
    setFightText(trainerText);

    const newOpponentHp = opponentHp - myDamage;
    const newOpponentHpRate = (newOpponentHp / opponentPokemon.base.hp) * 100;
    newOpponentHp <= 0 ? setOpponentHp(0) : setOpponentHp(newOpponentHp);
    setOpponentHpRate(newOpponentHpRate);
    setTrainerAttack(!trainerAttack);
  };

  // Opponent's turn
  useEffect(() => {
    let timeout;
    if (opponentHp > 0) {
      setTimeout(() => {
        let opponentDamage = calculateDamage(opponentPokemon, myPokemon);
        let opponentText = `Foe ${opponentPokemon.name.en.toUpperCase()} inflicts ${opponentDamage} DAMAGE`;

        // 10% chance of miss and 0 damage
        const miss = Math.random();
        if (miss < 0.1) {
          opponentDamage = 0;
          opponentText = `Foe ${opponentPokemon.name.en.toUpperCase()} misses!`;
        } else {
          setVibrate(true); // vibrate animation
          setTimeout(() => {
            setVibrate(false);
          }, 800);
        }
        setFightText(opponentText);

        const newMyHp = myHp - opponentDamage;
        const newTrainerHpRate = (newMyHp / myPokemon.base.hp) * 100;
        newMyHp <= 0 ? setMyHp(0) : setMyHp(newMyHp);
        setTrainerHpRate(newTrainerHpRate);
        setFightEnabled(true);
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [trainerAttack]);

  const fleeFight = () => {
    setBattleStatus("inactive");
    setMyPokemonId(0);
  };

  return (
    <div className="battle">
      {loading && <div className="pokeball"></div>}
      <div>
        {/*ANIMATION FOR OPPONENT PKMN */}

        {opponentPokemon ? (
          <section className="opponent">
            {/* <h2>Opponent Pokemon</h2> */}
            <div className="stat-box">
              <h2>
                {opponentPokemon.name.en.slice(0, 1).toUpperCase() +
                  opponentPokemon.name.en.slice(1)}
              </h2>
              <div className="health-container hp-opponent">
                <p className="health-hp">HP</p>
                <div className="health-back"></div>
                {typeof opponentHpRate === "number" ? (
                  <div
                    style={{ width: `${opponentHpRate}%` }}
                    className="health-bar"
                  ></div>
                ) : null}
              </div>
              {opponentPokemon ? (
                <p className="hp">
                  {opponentHp}/{opponentPokemon.base.hp} HP
                </p>
              ) : null}
            </div>
            {battleStatus === "active" ? (
              <img
                className={vibrateOpponent ? "vibrate" : ""}
                src={
                  opponentPokemon.sprites.other.showdown.front_default ||
                  opponentPokemon.sprites.front_default
                }
                alt={opponentPokemon.name.en}
              />
            ) : null}
            <div className="circle"></div>
          </section>
        ) : null}

        {/*ANIMATION FOR TRAINER PKMN*/}

        {myPokemon ? (
          <section className="trainer">
            {battleStatus === "active" ? (
              <img
                className={vibrate ? "vibrate" : ""}
                src={
                  myPokemon.sprites.other.showdown.back_default ||
                  myPokemon.sprites.front_default
                }
                alt={myPokemon.name.en}
              />
            ) : null}
            <div className="circle"></div>
            <div className="stat-box">
              <h2>
                {myPokemon.name.en.slice(0, 1).toUpperCase() +
                  myPokemon.name.en.slice(1)}
              </h2>
              <div className="health-container hp-triner">
                <p className="health-hp">HP</p>
                <div className="health-back"></div>
                {typeof trainerHpRate === "number" ? (
                  <div
                    style={{ width: `${trainerHpRate}%` }}
                    className="health-bar"
                  ></div>
                ) : null}
              </div>
              {myPokemon ? (
                <p className="hp">
                  {myHp}/{myPokemon.base.hp} HP{" "}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {/*TEXT BOX AND BUTTONS*/}

        <section className="text-box">
          {battleStatus === "inactive" ? (
            <>
              <p>Choose your Pokémon to start the game</p>
              <select
                name="pkmnId"
                id="pkmnId"
                onChange={(e) => setMyPokemonId(e.target.value)}
              >
                <option value="0">Choose a Pokémon</option>
                {user
                  ? user.team.map((poke) => (
                      <option value={poke.id}>
                        {poke.name.slice(0, 1).toUpperCase() +
                          poke.name.slice(1)}
                      </option>
                    ))
                  : null}
              </select>
            </>
          ) : (
            <p> {fightText} </p>
          )}
        </section>

        {battleStatus === "active" && fightEnabled ? (
          <>
            <button onClick={startFight}>Fight</button>
            <button
              className="special-attack-btn"
              disabled={specialAttackUsed}
              onClick={() => startFight("special")}
            >
              Special Attack
            </button>
          </>
        ) : null}
        {battleStatus === "active" && fightEnabled ? (
          <button onClick={fleeFight}>Flee</button>
        ) : null}
      </div>
    </div>
  );
};

export default Battle;
