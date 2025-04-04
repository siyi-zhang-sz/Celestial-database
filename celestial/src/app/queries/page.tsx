"use client";

import React, { useState } from "react";
import FeatureCard from "../components/FeatureCard";
import QueryPanel from "../components/QueryPanel";
import DbResults from "../components/DbResults";

export default function Page() {
  type AggregationType = "group" | "having" | "nested" | "division" | null;
  const [aggregation, setAggregation] = useState<AggregationType>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>("galaxy");
  const [refreshData, setRefreshData] = useState<boolean>(false);
  const [overrideData, setOverrideData] = useState<any[] | null>(null); 

  const handleRefresh = () => {
    setRefreshData((prev) => !prev);
    setOverrideData(null); 
    handleAggregration(null);
  };

  const handleAggregration = (mode: AggregationType) => {
    console.log("Aggregation:", mode);
    setOverrideData(null);
    setTimeout(() => {
      setAggregation(mode);
    }, 0);
  };
  return (
    <main className="card-grid">
      <FeatureCard title="" description="" color="blue">
        <QueryPanel
          onEntitySelect={(entity) => {
            setSelectedEntity(entity);
            setOverrideData(null);
          }}
          onRefresh={handleRefresh}
          onJoinResult={(data) => {
            console.log("Join data received in Page.tsx:", data);
            console.log(data);
            setOverrideData(data);
          }}
          onAggregation={handleAggregration}
        />
      </FeatureCard>

      <FeatureCard title="" description="" color="green">
        <DbResults
          key={aggregation ?? selectedEntity}
          entity={selectedEntity}
          refreshData={refreshData}
          overrideData={overrideData ?? undefined} 
          mode = {aggregation}
        />
      </FeatureCard>
    </main>
  );
}
