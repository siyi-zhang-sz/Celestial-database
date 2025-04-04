"use client";

import React, { useState, useEffect } from "react";
import styles from "./DbResults.module.css";

type AggregationType = "group" | "having" | "nested" | "division" | null;

interface DbResultsProps {
  entity: string;
  refreshData: boolean;
  mode: AggregationType;
  overrideData?: any[];
}

const normalizeKeys = (row: any): any => row;

const DbResults: React.FC<DbResultsProps> = ({
  entity,
  refreshData,
  overrideData,
  mode,
}) => {
  const normalizeKeys = (row: any): any => {
    console.log("[RAW ORACLE KEYS]", Object.keys(row));
    return row;
  };

  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(overrideData) && overrideData.length > 0) {
      const normalized = overrideData.map(normalizeKeys);
      setData(normalized);
      setColumns(Object.keys(normalized[0]));
    }
  }, [overrideData]);

  useEffect(() => {
    if (Array.isArray(overrideData) && overrideData.length > 0) return;

    if (!entity && mode === null) {
      setData([]);
      setColumns([]);
      return;
    }

    setLoading(true);

    const fetchAndSet = async (apiPath: string) => {
      try {
        console.log("[FETCHING]", apiPath);
        const res = await fetch(apiPath);
        const result = await res.json();
        console.log("[RESPONSE]", result);

        if (result.success && Array.isArray(result.data)) {
          const normalized = result.data.map(normalizeKeys);
          setData(normalized);
          setColumns(normalized.length > 0 ? Object.keys(normalized[0]) : []);
        } else {
          setData([]);
          setColumns([]);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to fetch ${apiPath}:`, err);
        setData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    if (mode === "group") {
      fetchAndSet("/api/planet-count-by-star");
    } else if (mode === "having") {
      fetchAndSet("/api/stars-with-many-planets");
    } else if (mode === "nested") {
      fetchAndSet("/api/biologically-rich-planets");
    } else if (mode === "division") {
      fetchAndSet("/api/planets-with-all-lifeform-types");
    } else if (mode === null) {
      fetchAndSet(`/api/${entity.toLowerCase()}`);
    }
  }, [entity, refreshData, overrideData, mode]);

  return (
    <section className={styles.rightPanel}>
      <h1 className={styles.entityTitle}>
        {overrideData
          ? "Join Result"
          : entity
          ? entity
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/^./, (s) => s.toUpperCase())
          : "No Table Selected"}
      </h1>

      <h2 className={styles.resultsTitle}>Query Results</h2>
      <div className={styles.resultsBox}>
        {loading ? (
          <p>Loading data...</p>
        ) : columns.length > 0 ? (
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p>No data to display</p>
        )}
      </div>
    </section>
  );
};

export default DbResults;
