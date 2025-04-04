"use client";
import styles from "./page.module.css";

export default function complexQueries() {
  return (
    <main className={styles.page}>
      {/* Left Panel: Query Triggers */}
      <section className={styles.leftPanel}>
        <h1 className={styles.heading}>Advanced Queries</h1>

        {/* Aggregation with GROUP BY */}
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>7. Aggregation with GROUP BY</h2>
          <p>Get the number of moons orbiting each planet.</p>
          <button className={styles.selectButton}>Run Query</button>
        </div>

        {/* Aggregation with HAVING */}
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>8. Aggregation with HAVING</h2>
          <p>Find stars that have more than 2 planets orbiting them.</p>
          <button className={styles.selectButton}>Run Query</button>
        </div>

        {/* Nested Aggregation with GROUP BY */}
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>
            9. Nested Aggregation with GROUP BY
          </h2>
          <p>
            Find lifeforms whose average age is greater than the average age of
            all lifeforms in each class.
          </p>
          <button className={styles.selectButton}>Run Query</button>
        </div>

        {/* Division */}
        <div className={styles.queryBlock}>
          <h2 className={styles.queryTitle}>10. Division</h2>
          <p>
            Find planets that have all known types of molecules present in their
            atmosphere.
          </p>
          <button className={styles.selectButton}>Run Query</button>
        </div>
      </section>

      {/* Right Panel: Query Results */}
      <section className={styles.rightPanel}>
        <h2 className={styles.resultsTitle}>Query Results</h2>
        <div className={styles.resultsBox}>
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                <th>Attribute 1</th>
                <th>Attribute 2</th>
                <th>Attribute 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Example 1</td>
                <td>Example 2</td>
                <td>Example 3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
