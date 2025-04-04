"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const handleExploreClick = () => {
    router.push("/queries");
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.text}>
            <h1>Celestial DB</h1>
            <p>Hello! Welcome to the explorer of the universe</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={handleExploreClick}>
              Explore {"\u2728"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/*     <div className="card-wrapper">
  <FeatureCard
    title="Code"
    description="Writes fundamentally better code that has fewer bugs..."
    icon={<FaCode size={24} />}
    color="blue"
  />
</div>
 */
