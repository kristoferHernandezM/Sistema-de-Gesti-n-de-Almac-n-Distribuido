require("dotenv").config({ path: "../.env" });
const { MongoClient } = require("mongodb");

const replicaSet = process.env.REPLICA_SET || "rs0";

const mongoNodes = (process.env.MONGO_NODES || "")
  .split(",")
  .map(n => n.trim())
  .filter(Boolean);

const mongoArbiters = (process.env.MONGO_ARBITERS || "")
  .split(",")
  .map(n => n.trim())
  .filter(Boolean);

if (mongoNodes.length < 2 || mongoArbiters.length < 1) {
  throw new Error("Necesitas mínimo 2 nodos de datos y 1 arbiter");
}

console.log("Cargando configuración Replica Set...");
console.log({
  replicaSet,
  nodosDatos: mongoNodes,
  arbiters: mongoArbiters
});

async function obtenerClienteActivo() {
  const todosLosNodos = [...mongoNodes, ...mongoArbiters];

  for (const nodo of todosLosNodos) {
    try {
      const uri = `mongodb://${nodo}/?directConnection=true&serverSelectionTimeoutMS=3000`;
      const client = new MongoClient(uri);
      await client.connect();

      console.log(`Nodo disponible: ${nodo}`);
      return client;
    } catch (error) {
      console.log(`Nodo no disponible: ${nodo}`);
    }
  }

  throw new Error("Ningún nodo MongoDB está accesible.");
}

function generarConfigReplica() {
  let id = 0;

  return {
    _id: replicaSet,
    members: [
      ...mongoNodes.map((host, index) => ({
        _id: id++,
        host,
        priority: index === 0 ? 2 : 1,
        votes: 1
      })),
      ...mongoArbiters.map(host => ({
        _id: id++,
        host,
        arbiterOnly: true,
        priority: 0,
        votes: 1
      }))
    ]
  };
}

async function setDefaultWriteConcern(admin) {
  try {
    console.log("Configurando Default Read/Write Concern...");
    await admin.command({
      setDefaultRWConcern: 1,
      defaultWriteConcern: {
        w: 1
      }
    });

    console.log("Default Write Concern configurado correctamente.");
  } catch (error) {
    console.log("No se pudo configurar DefaultRWConcern o ya estaba configurado.");
    console.log(error.message);
  }
}

function normalizarMiembro(miembro) {
  return {
    _id: miembro._id,
    host: miembro.host,
    arbiterOnly: miembro.arbiterOnly || false,
    priority: miembro.priority ?? 1,
    votes: miembro.votes ?? 1
  };
}

function configsSonIguales(actual, esperada) {
  const miembrosActuales = actual.members
    .map(normalizarMiembro)
    .sort((a, b) => a._id - b._id);

  const miembrosEsperados = esperada.members
    .map(normalizarMiembro)
    .sort((a, b) => a._id - b._id);

  return JSON.stringify(miembrosActuales) === JSON.stringify(miembrosEsperados);
}

async function iniciarOReconfigurarReplica() {
  let client;

  try {
    client = await obtenerClienteActivo();
    const admin = client.db("admin");

    const configEsperada = generarConfigReplica();

    try {
      console.log("Intentando iniciar Replica Set...");
      const resultado = await admin.command({
        replSetInitiate: configEsperada
      });

      console.log("Replica Set iniciado correctamente.");
      console.log(resultado);

    } catch (error) {
      if (
        error.message.includes("already initialized") ||
        error.codeName === "AlreadyInitialized"
      ) {
        console.log("Replica Set ya estaba iniciado. Revisando configuración...");

        await setDefaultWriteConcern(admin);

        const configActualResp = await admin.command({
          replSetGetConfig: 1
        });

        const configActual = configActualResp.config;

        if (configsSonIguales(configActual, configEsperada)) {
          console.log("La configuración ya está correcta. No se requiere reconfigurar.");
        } else {
          console.log("La configuración cambió. Aplicando reconfiguración automática...");

          const nuevaConfig = {
            ...configActual,
            members: configEsperada.members,
            version: configActual.version + 1
          };

          const resultadoReconfig = await admin.command({
            replSetReconfig: nuevaConfig,
            force: true
          });

          console.log("Replica Set reconfigurado correctamente.");
          console.log(resultadoReconfig);
        }

      } else {
        throw error;
      }
    }

    console.log("Validando estado del Replica Set...");

    const status = await admin.command({
      replSetGetStatus: 1
    });

    status.members.forEach(member => {
      console.log(`${member.name} -> ${member.stateStr}`);
    });

  } catch (error) {
    console.error("Error crítico:", error.message);
  } finally {
    if (client) {
      await client.close();
    }

    console.log("Conexión cerrada.");
  }
}

iniciarOReconfigurarReplica();