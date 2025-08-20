import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";
import usePrivyBridge from "./hooks/usePrivyBridge.js";
import './index.css'

function PrivyBridgeWrapper() {
  usePrivyBridge();
  return null;      
}

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <PrivyProvider 
      appId={import.meta.env.VITE_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethodsAndOrder: {
          primary: ["privy:cmd8euall0037le0my79qpz42"],
        },
      }}
    >
      <PrivyBridgeWrapper />
      <App />
    </PrivyProvider>
  // </React.StrictMode>
);
