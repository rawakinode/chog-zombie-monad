import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function usePrivyBridge() {
  const { authenticated, user, login, logout, getAccessToken, ready } = usePrivy();

  useEffect(() => {
    // membuat global bridge sesuai ekspektasi Phaser
    window.PrivyBridge = {
      login,              // function
      logout,             // function
      getAccessToken,     // function
      isAuthenticated: () => authenticated, // function
      ready,              // boolean
      getUser: () => user || null,          // function
    };

    // kirim event ke Phaser supaya bisa update UI
    window.dispatchEvent(
      new CustomEvent("privy_update", { detail: window.PrivyBridge })
    );
  }, [authenticated, user, login, logout, getAccessToken, ready]);
}
