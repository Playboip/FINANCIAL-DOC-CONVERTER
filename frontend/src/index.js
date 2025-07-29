import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

console.log("Starting React app...");

try {
  const container = document.getElementById("root");
  console.log("Container found:", container);
  
  if (!container) {
    document.body.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h1>Error: Root element not found</h1></div>';
    throw new Error("Root container not found");
  }
  
  const root = createRoot(container);
  console.log("Root created successfully");
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("App rendered successfully");
  
} catch (error) {
  console.error("Failed to initialize React app:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial; background: #ffebee;">
      <h1 style="color: #c62828;">React App Failed to Load</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}
