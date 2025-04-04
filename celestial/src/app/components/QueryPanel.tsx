"use client";

import { useState, useEffect } from "react";
import styles from "./QueryPanel.module.css";

type AggregationType = "group" | "having" | "nested" | "division" | null;

const ENTITIES = [
  "galaxy",
  "interstellarMediums",
  "molecules",
  "star",
  "smallbodies",
  "rover",
  "satellite",
  "spaceStation",
  "comets",
  "asteroids",
  "interstellarClouds",
  "nebula",
  "element",
  "planet",
  "moonOrbits",
  "lifeForms",
  "spaceCrafts",
];

const entityAttributes: { [key: string]: string[] } = {
  galaxy: ["GalaxyName", "Diameter", "Age", "Mass"],
  molecules: [
    "ComponentName",
    "BondType",
    "Symmetry",
    "AtomicNumber",
    "AtomicMass",
  ],

  interstellarMediums: [
    "ISMName",
    "Temperature",
    "MagneticField",
    "Radiation",
    "CloudSize",
    "MolecularDensity",
    "NebulaLuminosity",
    "Opacity",
  ],
  star: [
    "StarName",
    "Classification",
    "RightAscension",
    "Declination",
    "Luminosity",
    "Age",
    "EstimatedObjects",
    "GalaxyName",
  ],
  planet: ["PlanetName", "Radius", "Density", "RotationalPeriod", "StarName"],
  moonOrbits: [
    "MoonName",
    "PlanetName",
    "Radius",
    "Density",
    "SurfaceGravity",
    "OrbitDistance",
  ],
  lifeForms: [
    "LFName",
    "Classification",
    "DiscoveryDate",
    "AverageLength",
    "PlanetName",
  ],
  nebula: [
    "ISMName",
    "Temperature",
    "MagneticField",
    "Radiation",
    "GalaxyName",
    "Luminosity",
    "Opacity",
  ],
  interstellarClouds: [
    "ISMName",
    "Temperature",
    "MagneticField",
    "Radiation",
    "GalaxyName",
    "sizee",
    "MolecularDensity",
  ],
  element: ["ComponentName", "AtomicNumber", "AtomicMass"],
  comets: [
    "BodyName",
    "DiscoveryDate",
    "OrbitType",
    "StarName",
    "Classification",
    "NuclearSize",
  ],
  asteroids: ["BodyName", "DiscoveryDate", "OrbitType", "StarName", "Types"],
  spaceStation: [
    "SpaceCraftName",
    "LaunchDate",
    "Affiliation",
    "Mission",
    "PlanetName",
    "Status",
    "OrbitHeight",
  ],
  satellite: [
    "SpaceCraftName",
    "LaunchDate",
    "Affiliation",
    "Mission",
    "PlanetName",
    "Types",
    "Propulsion",
  ],
  rover: [
    "SpaceCraftName",
    "LaunchDate",
    "Affiliation",
    "Mission",
    "PlanetName",
    "LandDate",
  ],
  spaceCrafts: [
    "SpaceCraftName",
    "LaunchDate",
    "Affiliation",
    "Mission",
    "PlanetName",
    "SpaceStationStatus",
    "SpaceStationOrbitHeight",
    "SatelliteTypes",
    "SatellitePropulsion",
    "RoverLandDate",
  ],
  smallbodies: [
    "BodyName",
    "DiscoveryDate",
    "OrbitType",
    "StarName",
    "CometClassification",
    "CometNuclearSize",
    "AsteroidTypes",
  ],
};

const entityKeys: { [key: string]: string[] } = {
  galaxy: ["GalaxyName"],
  star: ["StarName"],
  planet: ["PlanetName"],
  moonOrbits: ["MoonName", "PlanetName"],
  interstellarClouds: ["ISMName"],
  interstellarMediums: ["ISMName"],
  nebula: ["ISMName"],
  molecules: ["ComponentName"],
  element: ["ComponentName"],
  comets: ["BodyName"],
  asteroids: ["BodyName"],
  spaceStation: ["SpaceCraftName"],
  spaceCrafts: ["SpaceCraftName"],
  rover: ["SpaceCraftName"],
  satellite: ["SpaceCraftName"],
  lifeForms: ["LFName", "PlanetName"],
  smallbodies: ["BodyName"],
};

interface QueryPanelProps {
  onEntitySelect: (entity: string) => void;
  onRefresh: () => void;
  onJoinResult?: (data: any[]) => void;
  onAggregation: (mode: AggregationType) => void;
}

const QueryPanel: React.FC<QueryPanelProps> = ({
  onEntitySelect,
  onRefresh,
  onJoinResult,
  onAggregation,
}) => {
  const [selectedEntity, setSelectedEntity] = useState("galaxy");
  const [insertData, setInsertData] = useState<Record<string, string>>({});
  const [records, setRecords] = useState<any[]>([]);
  const [galaxies, setGalaxies] = useState<string[]>([]);
  const [selectedGalaxy, setSelectedGalaxy] = useState("");
  const [joinResults, setJoinResults] = useState<any[]>([]);
  const attributes = entityAttributes[selectedEntity] || [];
  const [deleteConditions, setDeleteConditions] = useState<
    Record<string, string>
  >({});
  const [selectedLifeform, setSelectedLifeform] = useState("");
  const [starRecords, setStarRecords] = useState<any[]>([]);
  const [updateData, setUpdateData] = useState<Record<string, string>>({});
  const [conditions, setConditions] = useState([
    { attribute: "starName", operator: "=", value: "Sun", conjunction: "" },
  ]);
  const [projectionAttrs, setProjectionAttrs] = useState<string[]>([]);

  const updateCondition = (
    index: number,
    field: keyof (typeof conditions)[number],
    value: string
  ) => {
    const updated = [...conditions];
    updated[index][field] = value;
    setConditions(updated);
  };

  const buildWhereClause = () => {
    return conditions
      .map((cond, idx) => {
        const value =
          isNaN(Number(cond.value)) && cond.operator !== "LIKE"
            ? `'${cond.value}'`
            : cond.operator === "LIKE"
            ? `'%${cond.value}%'`
            : cond.value;

        const prefix = idx === 0 ? "" : ` ${cond.conjunction} `;
        return `${prefix}${cond.attribute} ${cond.operator} ${value}`;
      })
      .join("");
  };

  const handleEntityChange = (entity: string) => {
    setSelectedEntity(entity);
    setUpdateData({});
    setInsertData({});
    onEntitySelect(entity);
    onAggregation(null);
  };

  const normalizeRecordKeys = (record: any) => {
    const normalized: Record<string, any> = {};
    for (const attr of attributes) {
      normalized[attr] = record[attr.toUpperCase()]?.toString() ?? "";
    }
    return normalized;
  };

  const handleJoinQuery = async () => {
    if (!selectedGalaxy) return;

    try {
      const res = await fetch(
        `/api/lifeforms-in-galaxy/${encodeURIComponent(selectedGalaxy)}`
      );
      const result = await res.json();

      console.log("API JOIN RESULT:", result);

      if (result.success && Array.isArray(result.data)) {
        setJoinResults(result.data);
        if (onJoinResult) onJoinResult(result.data);
      }
    } catch (err) {
      console.error("Join query error:", err);
    }
  };

  useEffect(() => {
    const keys = entityKeys[selectedEntity] || [];
    setDeleteConditions(
      keys.reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {} as Record<string, string>)
    );
  }, [selectedEntity]);

  useEffect(() => {
    if (!selectedEntity) return;

    fetch(`/api/${selectedEntity}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRecords(data.data);
        } else {
          setRecords([]);
        }
      })
      .catch((err) => {
        console.error(`Failed to fetch ${selectedEntity}:`, err);
        setRecords([]);
      });
  }, [selectedEntity, onRefresh]);

  useEffect(() => {
    fetch("/api/galaxy")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const galaxyNames = data.data.map((g: any) => g.GALAXYNAME);
          setGalaxies(galaxyNames);
        }
      });
  }, []);

  return (
    <div className={styles.queryPanel}>
      <div className={styles.navbar}>
        {ENTITIES.map((entity) => (
          <button
            key={entity}
            className={`${styles.navButton} ${
              selectedEntity === entity ? styles.activeButton : ""
            }`}
            onClick={() => handleEntityChange(entity)}
          >
            {entity}
          </button>
        ))}
      </div>

      <h1 className={styles.heading}>Celestial DB - {selectedEntity}</h1>

      {/* 1. INSERT*/}
      <div className={styles.queryBlock}>
        <h2 className={styles.queryTitle}>1. Insert</h2>
        {attributes.map((attr) => (
          <input
            key={attr}
            type="text"
            placeholder={attr}
            value={insertData[attr] || ""}
            onChange={(e) =>
              setInsertData({ ...insertData, [attr]: e.target.value })
            }
            className={styles.input}
          />
        ))}
        <button
          className={`${styles.actionButton} ${styles.insertButton}`}
          onClick={async () => {
            if (selectedEntity === "planet") {
              const payload = {
                name: insertData.PlanetName,
                radius: parseFloat(insertData.Radius),
                density: parseFloat(insertData.Density),
                period: parseFloat(insertData.RotationalPeriod),
                starName:
                  insertData.StarName?.trim() === ""
                    ? null
                    : insertData.StarName.trim(),
              };

              try {
                const res = await fetch("/api/insert-planet", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                const result = await res.json();

                if (res.ok && result.success) {
                  setInsertData({});
                  onRefresh();
                  alert("Planet inserted successfully!");
                } else {
                  alert(`Insert failed: ${result.message || "Unknown error"}`);
                }
              } catch (err) {
                console.error("Insert error:", err);
                alert("Server error while inserting planet");
              }
            }
          }}
        >
          Insert
        </button>
      </div>
      {/* UPDATE */}
      <div className={styles.queryBlock}>
        <h2 className={styles.queryTitle}>2. Update</h2>

        {records.length > 0 && (
          <>
            <select
              className={styles.input}
              value={
                entityKeys[selectedEntity]?.[0]
                  ? updateData[entityKeys[selectedEntity][0]] || ""
                  : ""
              }
              onChange={(e) => {
                const pk = entityKeys[selectedEntity][0];
                const selected = records.find(
                  (r) => r[pk.toUpperCase()]?.toString() === e.target.value
                );

                if (selected) {
                  const normalized = normalizeRecordKeys(selected);
                  setUpdateData(normalized);
                } else {
                  setUpdateData({});
                }
              }}
            >
              <option value="">Select a record to update</option>
              {records.map((row, idx) => {
                const pk = entityKeys[selectedEntity][0];
                return (
                  <option key={idx} value={row[pk.toUpperCase()]}>
                    {row[pk.toUpperCase()]}
                  </option>
                );
              })}
            </select>

            {entityAttributes[selectedEntity]?.map((attr) => (
              <input
                key={attr}
                type="text"
                placeholder={attr}
                value={updateData[attr] || ""}
                onChange={(e) =>
                  setUpdateData({ ...updateData, [attr]: e.target.value })
                }
                className={styles.input}
              />
            ))}

            <button
              className={`${styles.actionButton} ${styles.updateButton}`}
              onClick={async () => {
                const keys = entityKeys[selectedEntity].reduce(
                  (acc, k) => ({
                    ...acc,
                    [k]: updateData[k],
                  }),
                  {}
                );

                const values = entityAttributes[selectedEntity].reduce(
                  (acc, attr) =>
                    entityKeys[selectedEntity].includes(attr)
                      ? acc
                      : { ...acc, [attr]: updateData[attr] },
                  {}
                );

                const res = await fetch(`/api/update/${selectedEntity}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ keys, values }),
                });

                const result = await res.json();
                if (result.success) {
                  onRefresh();
                } else {
                  alert("Update failed");
                }
              }}
            >
              Update
            </button>
          </>
        )}
      </div>

      {/* DELETE*/}
      {selectedEntity === "lifeForms" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>
            3. Oh no! A species went extinct! Remove from database?
          </h2>

          <select
            className={styles.input}
            value={selectedLifeform}
            onChange={(e) => {
              const [lfName, planetName] = e.target.value.split("||");
              setSelectedLifeform(e.target.value);
              setDeleteConditions({ LFName: lfName, PlanetName: planetName });
            }}
          >
            <option value="">Select lifeform to delete</option>
            {records.map((row, index) => (
              <option key={index} value={`${row.LFNAME}||${row.PLANETNAME}`}>
                {row.LFNAME} (Planet: {row.PLANETNAME})
              </option>
            ))}
          </select>

          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={async () => {
              const { LFName } = deleteConditions;
              if (!LFName) return;

              try {
                const res = await fetch(
                  `/api/delete-lifeform/${encodeURIComponent(LFName)}`,
                  {
                    method: "DELETE",
                  }
                );
                const result = await res.json();
                if (result.success) {
                  setDeleteConditions({ LFName: "", PlanetName: "" });
                  onRefresh();
                } else {
                  alert("Delete failed.");
                }
              } catch (err) {
                console.error("Delete error:", err);
                alert("Server error");
              }
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* SELECT */}

      {selectedEntity === "star" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>4. Selection</h2>

          {conditions.map((cond, index) => (
            <div key={index} className={styles.conditionRow}>
              {index !== 0 && (
                <select
                  value={cond.conjunction}
                  onChange={(e) =>
                    updateCondition(index, "conjunction", e.target.value)
                  }
                  className={styles.input}
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}

              <select
                value={cond.attribute}
                onChange={(e) =>
                  updateCondition(index, "attribute", e.target.value)
                }
                className={styles.input}
              >
                {entityAttributes["star"].map((attr) => (
                  <option key={attr} value={attr}>
                    {attr}
                  </option>
                ))}
              </select>

              <select
                value={cond.operator}
                onChange={(e) =>
                  updateCondition(index, "operator", e.target.value)
                }
                className={styles.input}
              >
                <option value="=">=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="LIKE">LIKE</option>
              </select>

              <input
                className={styles.input}
                placeholder="Value"
                value={cond.value}
                onChange={(e) =>
                  updateCondition(index, "value", e.target.value)
                }
              />
            </div>
          ))}

          <button
            className={`${styles.actionButton} ${styles.insertButton}`}
            onClick={() =>
              setConditions([
                ...conditions,
                { attribute: "", operator: "=", value: "", conjunction: "AND" },
              ])
            }
          >
            + Add Condition
          </button>

          <button
            className={`${styles.actionButton} ${styles.selectButton}`}
            onClick={async () => {
              const where = buildWhereClause();

              const send = "SELECT * FROM star WHERE " + where;
              console.log("WHERE clause to send:", send);

              try {
                const res = await fetch("/api/select-star", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ send }),
                });

                const result = await res.json();

                if (result.success && Array.isArray(result.data)) {
                  onJoinResult?.(result.data);
                } else {
                  alert("No matching results");
                }
              } catch (err) {
                console.error("Selection error:", err);
                alert("Server error");
              }
            }}
          >
            Run Selection
          </button>
        </div>
      )}

      {/* PROJECTION */}
      {selectedEntity === "lifeForms" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>5. Projection</h2>

          {attributes.map((attr) => (
            <label key={attr}>
              <input
                type="checkbox"
                checked={projectionAttrs.includes(attr)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProjectionAttrs([...projectionAttrs, attr]);
                  } else {
                    setProjectionAttrs(
                      projectionAttrs.filter((a) => a !== attr)
                    );
                  }
                }}
              />{" "}
              {attr}
              <br />
            </label>
          ))}

          <button
            className={`${styles.actionButton} ${styles.insertButton}`}
            onClick={async () => {
              if (selectedEntity !== "lifeForms") {
                alert("Projection currently only supported for lifeForms.");
                return;
              }

              try {
                const res = await fetch("/api/project-lifeforms", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ attributes: projectionAttrs }),
                });

                const result = await res.json();

                if (result.success && Array.isArray(result.data)) {
                  onJoinResult?.(result.data);
                } else {
                  alert("No data found.");
                }
              } catch (err) {
                console.error("Projection error:", err);
                alert("Server error during projection");
              }
            }}
          >
            Run Projection
          </button>
        </div>
      )}

      {/* JOIN */}
      {selectedEntity === "lifeForms" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>6. Lifeforms in Galaxy</h2>
          <select
            className={styles.input}
            value={selectedGalaxy}
            onChange={(e) => setSelectedGalaxy(e.target.value)}
          >
            <option value="">Select Galaxy</option>
            {galaxies.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            className={`${styles.actionButton} ${styles.updateButton}`}
            onClick={handleJoinQuery}
          >
            Run Lifeform Join
          </button>
        </div>
      )}

      {/* AGGREGRATION WITH GROUP-BY */}
      {selectedEntity === "star" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>
            7. Stars per Planet(Aggregation with GROUP-BY)
          </h2>
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => onAggregation("group")}
          >
            Run Aggregration
          </button>
        </div>
      )}

      {/* AGGREGRATION WITH HAVING */}
      {selectedEntity === "star" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>
            8. Popular Stars (Aggregation with HAVING)
          </h2>
          <button
            className={`${styles.actionButton} ${styles.selectButton}`}
            onClick={() => onAggregation("having")}
          >
            Run Popular Stars
          </button>
        </div>
      )}

      {/* AGGREGRATION WITH NESTING */}
      {selectedEntity === "planet" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>
            9. Planets with an above-average number of life forms compared to
            other planets.
          </h2>
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => onAggregation("nested")}
          >
            Run Nested
          </button>
        </div>
      )}

      {/* DIVISION */}
      {selectedEntity === "planet" && (
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>10. Division</h2>
          <p>
            Show all planets that host <strong>every</strong> type of life form
            classification.
          </p>
          <button
            className={`${styles.actionButton} ${styles.selectButton}`}
            onClick={() => onAggregation("division")}
          >
            Run Division
          </button>
        </div>
      )}
    </div>
  );
};
export default QueryPanel;
