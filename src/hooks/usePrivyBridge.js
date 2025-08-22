import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function usePrivyBridge() {
  const { authenticated, user, login, logout, getAccessToken, ready } = usePrivy();

  useEffect(() => {
    window.PrivyBridge = {
      login,
      logout,
      getAccessToken,
      isAuthenticated: () => authenticated,
      ready,
      getUser: () => user || null,
    };

    // kirim event ke Phaser supaya bisa update UI
    window.dispatchEvent(
      new CustomEvent("privy_update", { detail: window.PrivyBridge })
    );
  }, [authenticated, user, login, logout, getAccessToken, ready]);
}
