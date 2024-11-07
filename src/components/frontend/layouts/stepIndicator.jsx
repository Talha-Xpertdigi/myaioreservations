import React from "react";
import "./stepIndicator.css"; 

const StepIndicator = ({ currentStep }) => {
  const steps = ["1", "2", "3", "4"]; 
  const totalSteps = steps.length;

  return (
    <>
    <style>
      {
        `
        /* stepIndicator.css */
  .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      position: relative;
    }
    
    .step-container {
      display: flex;
      align-items: center;
      position: relative;
    }
    
    .step {
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #50497f; /* Your primary color */
      border-radius: 50%;
      font-weight: bold;
      color: #50497f;
      z-index: 1;
      background-color: white;
      transition: background-color 2s ease, color 2s ease;
    }
    
    .step.completed {
      background-color: #50497f; /* Color for completed and active steps */
      color: white;
    }
    
    .progress-line {
      width: 60px; /* Adjust the width between steps */
      height: 4px;
      background-color: #ddd; /* Background color for unfilled progress */
      position: relative;
    }
    
    .progress-bar {
      height: 100%;
      background-color: #50497f; /* Progress bar color */
      transition: width 0.5s ease-in-out;
    }
    
        `
      }
    </style>
    <div className="step-indicator">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index + 1;
        const isActive = currentStep === index + 1;

        return (
          <div key={index} className="step-container">
            <div
              className={`step ${isCompleted || isActive ? "completed" : ""}`}
            >
              {step}
            </div>
            {index < totalSteps - 1 && (
              <div className="progress-line">
                <div
                  className="progress-bar"
                  style={{
                    width: isCompleted ? "100%" : "0%",
                    transition: "width 0.5s ease-in-out",
                  }}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
    </>
  );
};

export default StepIndicator;
