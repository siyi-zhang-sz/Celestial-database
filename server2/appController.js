const express = require('express');
const appService = require('./appService');

const router = express.Router();


router.post('/insert-planet', async (req, res) => {
  try {
    const { name, radius, density, period, starName } = req.body;

    if (!name || isNaN(radius) || isNaN(density) || isNaN(period) || !starName) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid parameters",
      });
    }

    const result = await appService.insertPlanet(name, radius, density, period, starName);

    if (result.success) {
      return res.json({ success: true });
    }

    switch (result.error) {
      case "DUPLICATE_PLANET":
        return res.status(409).json({
          success: false,
          message: "Planet with this name already exists.",
        });
      case "MISSING_STAR":
        return res.status(400).json({
          success: false,
          message: "The specified star does not exist.",
        });
      default:
        return res.status(500).json({
          success: false,
          message: "An unknown error occurred while inserting the planet.",
        });
    }
  } catch (err) {
    console.error("insert-planet route error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});



router.get('/moon-orbits', async (req, res) => {
    try {
        const result = await appService.getRelation("moonOrbits");
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error fetching moon orbits:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/update/:table', async (req, res) => {
  const { table } = req.params;
  const { keys, values } = req.body;

  try {
    const result = await appService.updateGeneric(table, keys, values);
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Update failed' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/update-star/:starName', async (req, res) => {
    const { starName } = req.params;
    const {
      classification,
      rightAscension,
      declination,
      luminosity,
      age,
      estimatedObjects,
      galaxyName,
    } = req.body;
  
    const result = await appService.updateStar(
      starName,
      classification,
      rightAscension,
      declination,
      luminosity,
      age,
      estimatedObjects,
      galaxyName
    );
  
    if (result.success) {
      res.json({ success: true });
    } else if (result.error === 'NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Star not found' });
    } else {
      res.status(500).json({ success: false, message: 'Update failed' });
    }
});

router.delete('/delete-lifeform/:lfName', async (req, res) => {
    const lfName = decodeURIComponent(req.params.lfName); 
    const result = await appService.deleteLifeform(lfName);

    if (result.success) {
        res.json({ success: true });
    } else if (result.error === 'NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Lifeform not found' });
    } else {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/lifeforms-in-galaxy/:galaxyName', async (req, res) => {
    const { galaxyName } = req.params;
  
    try {
      const result = await appService.getLifeformsInGalaxy(galaxyName);
      res.json({ success: true, data: result });
    } catch (err) {
      console.error('Error running join query:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});
  
router.get('/planet-count-by-star', async (req, res) => { // WORKS
    try {
      const result = await appService.getPlanetCountByStar();
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Aggregation query failed:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });


  router.get('/stars-with-many-planets', async (req, res) => {
    try {
      const result = await appService.getStarsWithMoreThanFivePlanets();
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Aggregation with HAVING failed:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  router.get('/biologically-rich-planets', async (req, res) => {
    try {
      const result = await appService.getBiologicallyRichPlanets();
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Nested aggregation query failed:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  router.get('/planets-with-all-lifeform-types', async (req, res) => {
    try {
      const result = await appService.getPlanetsWithAllLifeformTypes();
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Division query API failed:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });


  router.get('/:entity', async (req, res) => {
    const { entity } = req.params;
    try {
      const result = await appService.getRelation(entity);
      res.json({ success: true, data: result });
    } catch (err) {
      console.error(`Error fetching ${entity}:`, err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  router.get('/planets-with-all-lifeform-types', async (req, res) => {
    try {
      const result = await appService.getPlanetsWithAllLifeformTypes();
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("Division query API failed:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  router.post('/project-lifeforms', async (req, res) => {
    const rawAttributes = req.body.attributes || [];
    const allowedAttributes = ['LFName', 'Classification', 'DiscoveryDate', 'AverageLength', 'PlanetName'];

    let selectedAttributes = '*';

    if (Array.isArray(rawAttributes) && rawAttributes.length > 0) {
        const attributeList = rawAttributes
            .map(attr => attr.trim())
            .filter(attr => allowedAttributes.includes(attr));

        if (attributeList.length > 0) {
            selectedAttributes = attributeList.join(', ');
        }
    }

    const query = `SELECT ${selectedAttributes} FROM lifeforms`;
    const result = await appService.projectLifeForm(query);

    if (result && result.length > 0) {
        res.json({ success: true, data: result });
    } else if (result && result.length === 0) {
        res.status(404).json({ success: false, message: 'Life form not found' });
    } else {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/select-star', async (req, res) => {
    const query = req.body.send;
    const result = await appService.projectLifeForm(query);

    if (result && result.length > 0) {
        res.json({ success: true, data: result });
    } else if (result && result.length === 0) {
        res.status(404).json({ success: false, message: 'Star not found' });
    } else {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});


module.exports = router;