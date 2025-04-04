import React from "react";
import PropTypes from "prop-types";
import '../globals.css';


type FeatureCardProps = {
    title: string;
    description?: string;
    color: "blue" | "amber" | "green";
    children?: React.ReactNode;
  };
  
  const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    color,
    children
  }) => {
    return (
      <div className="feature-card">
        <div className="d-flex flex-column gap-2 mb-4">
          <h3 className="h5 fw-bold m-0">{title}</h3>
          {description && <p className="mb-0">{description}</p>}
        </div>
        {children}
      </div>
    );
  };
  

  export default FeatureCard;