const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.

async function insertPlanet(name, radius, density, period, starName) {
  return await withOracleDB(async (connection) => {
    try {
      const result = await connection.execute(
        `INSERT INTO PLANET (PlanetName, Radius, Density, RotationalPeriod, StarName) 
         VALUES (:name, :radius, :density, :period, :starName)`,
        { name, radius, density, period, starName },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        return { success: false, error: "NO_ROWS_AFFECTED" };
      }

      return { success: true };
    } catch (err) {
      if (err.errorNum === 1) {
        return { success: false, error: "DUPLICATE_PLANET" };
      } else if (err.errorNum === 2291) {
        return { success: false, error: "MISSING_STAR" };
      }
      return { success: false, error: "UNKNOWN_ERROR" };
    }
  });
}


async function getRelation(id) {
    console.log('[DEBUG] getRelation() called with id:', id);
  
    const normalizedId = id.toLowerCase().replace(/[\s-_]/g, '');
  
    const tableMap = {
      // Core Entities
      galaxy: "Galaxy",
      star: "Star",
      planet: "Planet",
      lifeforms: "LifeForms",
      moonorbits: "MoonOrbits",

      // Small Bodies
      smallbodies: "small_bodies_details",
      asteroids: "Asteroids",
      comets: "Comets",

      // Interstellar
      interstellarmediums: "interstellar_medium_details",
      interstellarclouds: "InterstellarClouds",
      nebula: "Nebula",

      // Chemistry
      molecules: "molecule_details",
      components: "components",
      elements: "element",

      // Spacecrafts & Subtypes (ISA)
      spacecrafts: "space_craft_details",
      spacestation: "SpaceStation",
      satellite: "Satellite",
      rover: "Rover"
    };
    const tableName = tableMap[normalizedId];
  
    if (!tableName) {
      console.error(`[ERROR] Table mapping for '${normalizedId}' not found`);
      return [];
    }
  
    return await withOracleDB(async (connection) => {
      const query = `SELECT * FROM ${tableName}`;
      console.log(`[EXECUTING QUERY] ${query}`);
  
      const result = await connection.execute(
        query,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      console.log(`[RESULT] ${tableName} rows:`, result.rows);
      return result.rows;
    }).catch((err) => {
      console.error(`[getRelation ERROR for ${tableName}]`, err);
      return [];
    });
  }
  
  async function updateStar(
    starName,
    classification,
    rightAscension,
    declination,
    luminosity,
    age,
    estimatedObjects,
    galaxyName
  ) {
    return await withOracleDB(async (connection) => {
      console.log({
        starName,
        classification,
        rightAscension,
        declination,
        luminosity,
        age,
        estimatedObjects,
        galaxyName,
      });
  
      const result = await connection.execute(
        `UPDATE star
         SET Classification = :classification,
             RightAscension = :rightAscension,
             Declination = :declination,
             Luminosity = :luminosity,
             Age = :age,
             EstimatedObjects = :estimatedObjects,
             GalaxyName = :galaxyName
         WHERE StarName = :starName`,
        {
          classification,
          rightAscension,
          declination,
          luminosity,
          age,
          estimatedObjects,
          galaxyName,
          starName,
        },
        { autoCommit: true }
      );
  
      if (result.rowsAffected === 0) {
        return { success: false, error: 'NOT_FOUND' };
      }
  
      return { success: true };
    }).catch(() => {
      return false;
    });
  }

  async function deleteLifeform(lfName) {
    return await withOracleDB(async (connection) => {
        console.log("🧹 Deleting lifeform:", lfName); // Debug log

        const result = await connection.execute(
            `DELETE FROM LifeForms WHERE LOWER(LFName) = LOWER(:lfName)`,
            { lfName },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            console.warn("Lifeform not found:", lfName);
            return { success: false, error: 'NOT_FOUND' };
        }

        console.log("Lifeform deleted:", lfName);
        return { success: true };
    }).catch((err) => {
        console.error('deleteLifeform error:', err);
        return false;
    });
}
  

async function getLifeformsInGalaxy(galaxyName) {
    return await withOracleDB(async (connection) => {
      const result = await connection.execute(
        `SELECT 
           lf.LFName,
           lf.Classification,
           TO_CHAR(lf.DiscoveryDate, 'YYYY-MM-DD') AS DiscoveryDate,
           lf.AverageLength,
           lf.PlanetName,
           p.StarName,
           s.GalaxyName
         FROM 
           LifeForms lf
         JOIN 
           Planet p ON lf.PlanetName = p.PlanetName
         JOIN 
           Star s ON p.StarName = s.StarName
         JOIN 
           Galaxy g ON s.GalaxyName = g.GalaxyName
         WHERE 
           LOWER(g.GalaxyName) = LOWER(:galaxyName)`,
        { galaxyName },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      return result.rows;
    });
  }
  
  async function getPlanetCountByStar() {
    return await withOracleDB(async (connection) => {
      const result = await connection.execute(
        `SELECT StarName, COUNT(*) AS PlanetCount
         FROM Planet
         GROUP BY StarName`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      return result.rows;
    }).catch((err) => {
      console.error("ERROR", err);
      return [];
    });
  }

  async function getStarsWithMoreThanFivePlanets() {
    return await withOracleDB(async (connection) => {
      const result = await connection.execute(
        `SELECT StarName, COUNT(*) AS PlanetCount
         FROM Planet
         GROUP BY StarName
         HAVING COUNT(*) > 2`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      return result.rows;
    }).catch((err) => {
      console.error("ERROR", err);
      return [];
    });
  }

  async function getBiologicallyRichPlanets() {
    return await withOracleDB(async (connection) => {
      const result = await connection.execute(
        `SELECT PlanetName, COUNT(*) AS LifeFormCount
         FROM LifeForms
         GROUP BY PlanetName
         HAVING COUNT(*) >= (
           SELECT AVG(LFCount)
           FROM (
             SELECT COUNT(*) AS LFCount
             FROM LifeForms
             GROUP BY PlanetName
           ) Sub
         )`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      return result.rows;
    }).catch((err) => {
      console.error("ERROR", err);
      return [];
    });
  }

  async function getPlanetsWithAllLifeformTypes() {
    return await withOracleDB(async (connection) => {
      const result = await connection.execute(
        `
        SELECT p.PlanetName
        FROM Planet p
        WHERE NOT EXISTS (
          SELECT lf.Classification
          FROM LifeForms lf
          MINUS
          SELECT lf2.Classification
          FROM LifeForms lf2
          WHERE lf2.PlanetName = p.PlanetName
        )
        `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      return result.rows;
    }).catch((err) => {
      console.error("Division query failed:", err);
      return [];
    });
  }
  
  async function projectLifeForm(query) {
    return await withOracleDB(async (connection) => {
        console.log(query);
        const result = await connection.execute(query,
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}
  async function updateGeneric(entity, keys, values) {
    const tableMap = {
      galaxy: "Galaxy",
      star: "Star",
      planet: "Planet",
      lifeforms: "LifeForms",
      moonorbits: "MoonOrbits",
      smallbodies: "SmallBodies",
      asteroids: "Asteroids",
      comets: "Comets",
      interstellarmediums: "InterstellarMedium",
      interstellarclouds: "InterstellarClouds",
      nebula: "Nebula",
      molecules: "Molecule",
      elements: "Element",
      spacestation: "SpaceStation",
      satellite: "Satellite",
      rover: "Rover",
    };
  
    const normalizedEntity = entity.toLowerCase().replace(/[\s-_]/g, '');
    const table = tableMap[normalizedEntity];
  
    if (!table) {
      console.error(`[updateGeneric] Unknown entity: ${entity}`);
      return { success: false, error: 'UNKNOWN_ENTITY' };
    }
  
    return await withOracleDB(async (connection) => {
      const setClause = Object.keys(values)
        .map((col, idx) => `${col} = :val${idx}`)
        .join(', ');
  
      const whereClause = Object.keys(keys)
        .map((col, idx) => `${col} = :key${idx}`)
        .join(' AND ');
  
      const binds = [
        ...Object.values(values).map((v, idx) => ({ [`val${idx}`]: v })),
        ...Object.values(keys).map((v, idx) => ({ [`key${idx}`]: v })),
      ].reduce((a, b) => ({ ...a, ...b }), {});
  
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  
      console.log('[🛠 UPDATE SQL]', query);
      console.log('[🧾 BINDS]', binds);
  
      const result = await connection.execute(query, binds, { autoCommit: true });
  
      return result.rowsAffected > 0
        ? { success: true }
        : { success: false, error: 'NOT_FOUND' };
    }).catch((err) => {
      console.error('[updateGeneric ERROR]', err);
      return { success: false };
    });
  }
  
  
//-----------------------------------------------------------------------------------

async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    insertPlanet,
    updateStar,
    getRelation,
    deleteLifeform,
    getLifeformsInGalaxy,
    getPlanetCountByStar,
    getStarsWithMoreThanFivePlanets,
    getBiologicallyRichPlanets,
    getPlanetsWithAllLifeformTypes,
    updateGeneric,
    projectLifeForm
};