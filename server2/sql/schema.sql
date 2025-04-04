drop table spaceCraftDetails;
drop table interstellar_medium_details;
drop table small_bodies_details;
drop table molecule_details;

drop table rover;
drop table satellite;
drop table spaceStation;
drop table spaceCraft;
drop table element;
drop table molecule;
drop table components;
drop table interstellarClouds;
drop table nebula;
drop table interstellarMedium;
drop table asteroids;
drop table comets;
drop table smallBodies;
drop table moonOrbits;
drop table lifeForms;
drop table planet;
drop table star;
drop table galaxy;


CREATE TABLE galaxy(
	GalaxyName VARCHAR(50) PRIMARY KEY,
	Diameter INT,
	Age INT,
	Mass INT
);

CREATE TABLE star(
	StarName VARCHAR(50) PRIMARY KEY,
	Classification VARCHAR(50),
	RightAscension INT,
	Declination INT,
	Luminosity FLOAT,
	Age INT,
	EstimatedObjects INT,
	GalaxyName VARCHAR(50),
	FOREIGN KEY (GalaxyName) REFERENCES Galaxy(GalaxyName) ON DELETE SET NULL -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE planet(
PlanetName VARCHAR(50) PRIMARY KEY,
Radius INT,
Density INT,
RotationalPeriod INT,
StarName VARCHAR(50),
FOREIGN KEY (StarName) REFERENCES Star(StarName) ON DELETE SET NULL -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE lifeForms(
LFName VARCHAR(50) PRIMARY KEY,
Classification VARCHAR(50), 
DiscoveryDate DATE, 
AverageLength INT,
PlanetName VARCHAR(50) NOT NULL, 
FOREIGN KEY (PlanetName) REFERENCES Planet(PlanetName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE moonOrbits(
	MoonName VARCHAR(50),
	PlanetName VARCHAR(50) NOT NULL,
	Radius INT,
	Density INT,
	SurfaceGravity INT,
	OrbitDistance INT,
	PRIMARY KEY (MoonName, PlanetName),
	FOREIGN KEY (PlanetName) REFERENCES Planet(PlanetName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE smallBodies(
	BodyName VARCHAR(50) PRIMARY KEY,
	DiscoveryDate DATE,
	OrbitType VARCHAR(50),
	StarName VARCHAR(50),
	FOREIGN KEY (StarName) REFERENCES Star(StarName) ON DELETE SET NULL -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE comets(
	BodyName VARCHAR(50) PRIMARY KEY,
	Classification VARCHAR(50),
	NuclearSize INT,
	FOREIGN KEY (BodyName) REFERENCES smallBodies(BodyName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE asteroids(
	BodyName VARCHAR(50) PRIMARY KEY,
	Types VARCHAR(50),
	FOREIGN KEY (BodyName) REFERENCES SmallBodies(BodyName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE interstellarMedium(
	ISMName VARCHAR(50) PRIMARY KEY,
	Temperature INT,
	MagneticField FLOAT,
	Radiation FLOAT,
	GalaxyName VARCHAR(50),
	FOREIGN KEY (GalaxyName) REFERENCES Galaxy(GalaxyName) ON DELETE SET NULL -- NEEDS TO BE UPDATED ON CASCADE
);
	
CREATE TABLE nebula(
	ISMName VARCHAR(50) PRIMARY KEY,
	Luminosity FLOAT,
	Opacity FLOAT,
	FOREIGN KEY (ISMName) REFERENCES InterstellarMedium(ISMName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE interstellarClouds(
	ISMName VARCHAR(50) PRIMARY KEY,
	sizee Int,
	MolecularDensity FLOAT,
	FOREIGN KEY (ISMName) REFERENCES InterstellarMedium(ISMName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);
                                                                                                                                                                                                                                      
CREATE TABLE components(
	ComponentName VARCHAR(50) PRIMARY KEY
);

CREATE TABLE molecule(
ComponentName VARCHAR(50) PRIMARY KEY,
BondType VARCHAR(50),
Symmetry VARCHAR(50),
FOREIGN KEY (ComponentName) REFERENCES Components(ComponentName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE element(
ComponentName VARCHAR(50) PRIMARY KEY,
AtomicNumber INT UNIQUE,
AtomicMass FLOAT,
FOREIGN KEY (ComponentName) REFERENCES Components(ComponentName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE spaceCraft(
	SpaceCraftName VARCHAR(50) PRIMARY KEY,
	LaunchDate DATE,
	Affiliation VARCHAR(50),
	Mission VARCHAR(50),
	PlanetName VARCHAR(50) NOT NULL,
FOREIGN KEY (PlanetName) REFERENCES Planet(PlanetName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE spaceStation(
	SpaceCraftName VARCHAR(50) PRIMARY KEY,
	Status VARCHAR(50),
	OrbitHeight INT,
	FOREIGN KEY (SpaceCraftName) REFERENCES SpaceCraft(SpaceCraftName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE satellite(
	SpaceCraftName VARCHAR(50) PRIMARY KEY,
	Types VARCHAR(50),
	Propulsion VARCHAR(50),
FOREIGN KEY (SpaceCraftName) REFERENCES SpaceCraft(SpaceCraftName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

CREATE TABLE rover(
	SpaceCraftName VARCHAR(50) PRIMARY KEY,
	LandDate DATE,
FOREIGN KEY (SpaceCraftName) REFERENCES SpaceCraft(SpaceCraftName) ON DELETE CASCADE -- NEEDS TO BE UPDATED ON CASCADE
);

INSERT INTO galaxy VALUES ('Milky Way', 100000, 13000, 1500000);
INSERT INTO galaxy VALUES ('Andromeda', 220000, 10000, 2000000);
INSERT INTO galaxy VALUES ('Triangulum', 60000, 9000, 400000);
INSERT INTO galaxy VALUES ('Sombrero', 50000, 11000, 800000);
INSERT INTO galaxy VALUES ('Whirlpool', 76000, 12000, 600000);

INSERT INTO star VALUES ('Sun', 'G2V', 0, 0, 1, 4600, 8, 'Milky Way');
INSERT INTO star VALUES ('Sirius', 'A1V', 6, -16, 25, 240, 2, 'Milky Way');
INSERT INTO star VALUES ('Betelgeuse', 'M1Ia', 5, 7, 1200, 10, 0, 'Milky Way');
INSERT INTO star VALUES ('Vega', 'A0V', 18, 38, 40, 455, 0, 'Milky Way');
INSERT INTO star VALUES ('Proxima Centauri', 'M5Ve', 4, -62, 0.0017, 4850, 3, 'Milky Way');

INSERT INTO planet VALUES ('Earth', 6371, 5514, 24, 'Sun');
INSERT INTO planet VALUES ('Mars', 3390, 3934, 25, 'Sun');
INSERT INTO planet VALUES ('Jupiter', 69911, 1326, 10, 'Sun');
INSERT INTO planet VALUES ('Venus', 6052, 5243, 243, 'Sun');
INSERT INTO planet VALUES ('Mercury', 2439, 5427, 1408, 'Sun');

INSERT INTO lifeForms VALUES ('Homo sapiens', 'Mammal', TO_DATE('01-01-1750', 'MM-DD-YYYY'), 170, 'Earth');
INSERT INTO lifeForms VALUES ('Panthera leo', 'Mammal', TO_DATE('03-15-1820', 'MM-DD-YYYY'), 190, 'Earth');
INSERT INTO lifeForms VALUES ('Escherichia coli', 'Bacteria', TO_DATE('06-10-1885', 'MM-DD-YYYY'), 0, 'Earth');
INSERT INTO lifeForms VALUES ('Tyrannosaurus rex', 'Reptile', TO_DATE('10-05-1902', 'MM-DD-YYYY'), 1200, 'Earth');
INSERT INTO lifeForms VALUES ('Canis lupus', 'Mammal', TO_DATE('08-20-1758', 'MM-DD-YYYY'), 150, 'Earth');

INSERT INTO moonOrbits VALUES ('Moon', 'Earth', 1737, 3340, 162, 384400);
INSERT INTO moonOrbits VALUES ('Phobos', 'Mars', 11, 1590, 0, 9376);
INSERT INTO moonOrbits VALUES ('Deimos', 'Mars', 6, 1350, 0, 23460);
INSERT INTO moonOrbits VALUES ('Io', 'Jupiter', 1821, 3630, 180, 421700);
INSERT INTO moonOrbits VALUES ('Europa', 'Jupiter', 1560, 3010, 133, 670900);

INSERT INTO smallBodies VALUES ('Halley', TO_DATE('01-01-1682', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Hale-Bopp', TO_DATE('07-23-1995', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Ceres', TO_DATE('01-01-1801', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Vesta', TO_DATE('03-29-1807', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Hyakutake', TO_DATE('01-30-1996', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Borrelly', TO_DATE('09-21-2001', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Tempel 1', TO_DATE('04-03-1867', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Eros', TO_DATE('08-13-1898', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Pallas', TO_DATE('03-28-1802', 'MM-DD-YYYY'), 'Elliptical', 'Sun');
INSERT INTO smallBodies VALUES ('Juno', TO_DATE('09-01-1804', 'MM-DD-YYYY'), 'Elliptical', 'Sun');

INSERT INTO comets VALUES ('Halley', 'Short-period', 11);
INSERT INTO comets VALUES ('Hale-Bopp', 'Long-period', 40);
INSERT INTO comets VALUES ('Hyakutake', 'Long-period', 2);
INSERT INTO comets VALUES ('Borrelly', 'Short-period', 8);
INSERT INTO comets VALUES ('Tempel 1', 'Short-period', 6);

INSERT INTO asteroids VALUES ('Ceres', 'C-type');
INSERT INTO asteroids VALUES ('Vesta', 'V-type');
INSERT INTO asteroids VALUES ('Eros', 'S-type');
INSERT INTO asteroids VALUES ('Pallas', 'B-type');
INSERT INTO asteroids VALUES ('Juno', 'S-type');

INSERT INTO interstellarMedium VALUES ('Orion', 10000, 0.5, 2.1, 'Milky Way');
INSERT INTO interstellarMedium VALUES ('Crab', 5000, 1.2, 10.5, 'Milky Way');
INSERT INTO interstellarMedium VALUES ('Eagle', 8000, 0.8, 3.4, 'Milky Way');
INSERT INTO interstellarMedium VALUES ('Carina', 12000, 0.9, 4.2, 'Milky Way');
INSERT INTO interstellarMedium VALUES ('Tarantula', 15000, 1.1, 5.6, 'Andromeda');

INSERT INTO nebula VALUES ('Orion', 100.5, 0.8);
INSERT INTO nebula VALUES ('Crab', 50.2, 0.6);
INSERT INTO nebula VALUES ('Eagle', 75.0, 0.7);
INSERT INTO nebula VALUES ('Carina', 120.0, 0.9);
INSERT INTO nebula VALUES ('Tarantula', 150.5, 0.85);

INSERT INTO interstellarClouds VALUES ('Orion', 24, 1000.5);
INSERT INTO interstellarClouds VALUES ('Crab', 15, 800.2);
INSERT INTO interstellarClouds VALUES ('Eagle', 20, 900.0);
INSERT INTO interstellarClouds VALUES ('Carina', 30, 1100.0);
INSERT INTO interstellarClouds VALUES ('Tarantula', 35, 1200.5);

INSERT INTO components VALUES ('Water');
INSERT INTO components VALUES ('Carbon Dioxide');
INSERT INTO components VALUES ('Methane');
INSERT INTO components VALUES ('Oxygen');
INSERT INTO components VALUES ('Nitrogen');
INSERT INTO components VALUES ('Hydrogen');
INSERT INTO components VALUES ('Carbon');
INSERT INTO components VALUES ('Helium');

INSERT INTO molecule VALUES ('Water', 'Covalent', 'Bent');
INSERT INTO molecule VALUES ('Carbon Dioxide', 'Covalent', 'Linear');
INSERT INTO molecule VALUES ('Methane', 'Covalent', 'Tetrahedral');
INSERT INTO molecule VALUES ('Oxygen', 'Covalent', 'Linear');
INSERT INTO molecule VALUES ('Nitrogen', 'Covalent', 'Linear');

INSERT INTO element VALUES ('Hydrogen', 1, 1.008);
INSERT INTO element VALUES ('Oxygen', 8, 15.999);
INSERT INTO element VALUES ('Carbon', 6, 12.011);
INSERT INTO element VALUES ('Nitrogen', 7, 14.007);
INSERT INTO element VALUES ('Helium', 2, 4.0026);

INSERT INTO SpaceCraft VALUES ('Apollo 11', TO_DATE('07-16-1969', 'MM-DD-YYYY'), 'NASA', 'Moon Landing', 'Earth');
INSERT INTO SpaceCraft VALUES ('Voyager 1', TO_DATE('09-05-1977', 'MM-DD-YYYY'), 'NASA', 'Interstellar', 'Earth');
INSERT INTO SpaceCraft VALUES ('Perseverance', TO_DATE('07-30-2020', 'MM-DD-YYYY'), 'NASA', 'Mars Exploration', 'Mars');
INSERT INTO SpaceCraft VALUES ('Hubble', TO_DATE('04-24-1990', 'MM-DD-YYYY'), 'NASA', 'Observation', 'Earth');
INSERT INTO SpaceCraft VALUES ('ISS', TO_DATE('11-20-1998', 'MM-DD-YYYY'), 'International', 'Research', 'Earth');
INSERT INTO SpaceCraft VALUES ('Mir', TO_DATE('02-19-1986', 'MM-DD-YYYY'), 'Soviet Union', 'Research', 'Earth');
INSERT INTO SpaceCraft VALUES ('Tiangong-1', TO_DATE('09-29-2011', 'MM-DD-YYYY'), 'CNSA', 'Research', 'Earth');
INSERT INTO SpaceCraft VALUES ('Skylab', TO_DATE('05-14-1973', 'MM-DD-YYYY'), 'NASA', 'Research', 'Earth');
INSERT INTO SpaceCraft VALUES ('Salyut 1', TO_DATE('04-19-1971', 'MM-DD-YYYY'), 'Soviet Union', 'Research', 'Earth');
INSERT INTO SpaceCraft VALUES ('Landsat 8', TO_DATE('02-11-2013', 'MM-DD-YYYY'), 'NASA', 'Earth Observation', 'Earth');
INSERT INTO SpaceCraft VALUES ('GOES-16', TO_DATE('11-19-2016', 'MM-DD-YYYY'), 'NOAA', 'Weather', 'Earth');
INSERT INTO SpaceCraft VALUES ('Sputnik 1', TO_DATE('10-04-1957', 'MM-DD-YYYY'), 'Soviet Union', 'Communication', 'Earth');
INSERT INTO SpaceCraft VALUES ('Kepler', TO_DATE('03-07-2009', 'MM-DD-YYYY'), 'NASA', 'Observation', 'Earth');
INSERT INTO SpaceCraft VALUES ('Curiosity', TO_DATE('11-26-2011', 'MM-DD-YYYY'), 'NASA', 'Mars Exploration', 'Mars');
INSERT INTO SpaceCraft VALUES ('Opportunity', TO_DATE('07-07-2003', 'MM-DD-YYYY'), 'NASA', 'Mars Exploration', 'Mars');
INSERT INTO SpaceCraft VALUES ('Spirit', TO_DATE('06-10-2003', 'MM-DD-YYYY'), 'NASA', 'Mars Exploration', 'Mars');
INSERT INTO SpaceCraft VALUES ('Sojourner', TO_DATE('12-04-1996', 'MM-DD-YYYY'), 'NASA', 'Mars Exploration', 'Mars');


INSERT INTO spaceStation VALUES ('ISS', 'Active', 408);
INSERT INTO spaceStation VALUES ('Mir', 'Deorbited', 350);
INSERT INTO spaceStation VALUES ('Tiangong-1', 'Deorbited', 340);
INSERT INTO spaceStation VALUES ('Skylab', 'Deorbited', 434);
INSERT INTO spaceStation VALUES ('Salyut 1', 'Deorbited', 200);

INSERT INTO Satellite VALUES ('Hubble', 'Telescope', 'None');
INSERT INTO Satellite VALUES ('Landsat 8', 'Earth Observation', 'None');
INSERT INTO Satellite VALUES ('GOES-16', 'Weather', 'None');
INSERT INTO Satellite VALUES ('Sputnik 1', 'Communication', 'None');
INSERT INTO Satellite VALUES ('Kepler', 'Telescope', 'None');

INSERT INTO Rover VALUES ('Perseverance', TO_DATE('02-18-2021', 'MM-DD-YYYY'));
INSERT INTO Rover VALUES ('Curiosity', TO_DATE('08-06-2012', 'MM-DD-YYYY'));
INSERT INTO Rover VALUES ('Opportunity', TO_DATE('01-25-2004', 'MM-DD-YYYY'));
INSERT INTO Rover VALUES ('Spirit', TO_DATE('01-04-2004', 'MM-DD-YYYY'));
INSERT INTO Rover VALUES ('Sojourner', TO_DATE('07-04-1997', 'MM-DD-YYYY'));

COMMIT; 


CREATE VIEW molecule_details AS
SELECT 
    m.ComponentName, 
    m.BondType, 
    m.Symmetry, 
    e.AtomicNumber, 
    e.AtomicMass
FROM 
    molecule m
LEFT JOIN 
    components c ON m.ComponentName = c.ComponentName
LEFT JOIN 
    element e ON c.ComponentName = e.ComponentName;

		CREATE VIEW interstellar_medium_details AS
SELECT 
    ism.ISMName, 
    ism.Temperature, 
    ism.MagneticField, 
    ism.Radiation,
    ic.sizee AS CloudSize,
    ic.MolecularDensity,
    n.Luminosity AS NebulaLuminosity,
    n.Opacity
FROM 
    interstellarMedium ism
LEFT JOIN 
    interstellarClouds ic ON ism.ISMName = ic.ISMName
LEFT JOIN 
    nebula n ON ism.ISMName = n.ISMName;

CREATE VIEW small_bodies_details AS
SELECT 
    sb.BodyName, 
    sb.DiscoveryDate, 
    sb.OrbitType, 
    sb.StarName,
    c.Classification AS CometClassification,
    c.NuclearSize AS CometNuclearSize,
    a.Types AS AsteroidTypes
FROM 
    smallBodies sb
LEFT JOIN 
    comets c ON sb.BodyName = c.BodyName
LEFT JOIN 
    asteroids a ON sb.BodyName = a.BodyName;

CREATE VIEW space_craft_details AS
SELECT 
    sc.SpaceCraftName, 
    sc.LaunchDate, 
    sc.Affiliation, 
    sc.Mission, 
    sc.PlanetName,
    ss.Status AS SpaceStationStatus,
    ss.OrbitHeight AS SpaceStationOrbitHeight,
    sa.Types AS SatelliteTypes,
    sa.Propulsion AS SatellitePropulsion,
    r.LandDate AS RoverLandDate
FROM 
    spaceCraft sc
LEFT JOIN 
    spaceStation ss ON sc.SpaceCraftName = ss.SpaceCraftName
LEFT JOIN 
    satellite sa ON sc.SpaceCraftName = sa.SpaceCraftName
LEFT JOIN 
    rover r ON sc.SpaceCraftName = r.SpaceCraftName;