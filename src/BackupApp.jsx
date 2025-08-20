
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export default function App() {
  const { authenticated, user, ready, login, logout, getAccessToken } = usePrivy();

  const [accountAddress, setAccountAddress] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState("");      // input skor
  const [saving, setSaving] = useState(false); // state loading saat submit

  // generate signature
  async function signHMAC(message, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return btoa(String.fromCharCode(...new Uint8Array(signature))); // base64

  }

  useEffect(() => {
    if (authenticated && user && ready) {
      const fetchData = async () => {
        try {
          const accessToken = await getAccessToken(); // session auth
          console.log("Access Token:", accessToken);
        } catch (err) {
          console.error("Error fetching access token or user data:", err);
        }
      };
      fetchData();

      if (user.linkedAccounts.length > 0) {
        const crossAppAccount = user.linkedAccounts.find(
          (account) =>
            account.type === "cross_app" &&
            account.providerApp.id === "cmd8euall0037le0my79qpz42"
        );

        if (crossAppAccount && crossAppAccount.embeddedWallets.length > 0) {
          const wallet = crossAppAccount.embeddedWallets[0].address;
          setAccountAddress(wallet);

          fetch(`https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${wallet}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.hasUsername && data.user) setUsername(data.user.username);
              else setUsername("");
            })
            .catch((err) => {
              console.error("Error fetching username:", err);
              setMessage("Failed to fetch username.");
            });
        } else setMessage("No embedded wallet found for this account.");
      } else setMessage("You need to link your Monad Games ID account to continue.");
    }
  }, [authenticated, user, ready]);

  // --- fungsi kirim skor ke backend ---
  const handleSaveScore = async () => {
    if (!score || isNaN(score)) {
      setMessage("Please enter a valid score.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const accessToken = await getAccessToken();

      const payload = {
        token: accessToken,
        score: Number(score),
        playerAddress: accountAddress,
        timestamp: Date.now()
      };

      const messageString = JSON.stringify(payload);

      const secret = import.meta.env.VITE_SECRET_KEY;
      const signature = await signHMAC(messageString, secret);

      const res = await fetch("http://localhost:3001/submitscore", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": signature },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Score saved! TxHash: ${data.gameTxHash}`);
      } else {
        setMessage(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error submitting score:", err);
      setMessage("Failed to submit score.");
    }

    setSaving(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {!authenticated ? (
        <button onClick={login}>Login with Privy</button>
      ) : (
        <>
          <p>Wallet: {accountAddress}</p>

          {username ? <p>Username: {username}</p> : (
            <div>
              <p>You don’t have a username yet.</p>
              <a
                href="https://monad-games-id-site.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Register your username here
              </a>
            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <input
              type="number"
              placeholder="Enter your score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <button onClick={handleSaveScore} disabled={saving}>
              {saving ? "Saving..." : "Save Score"}
            </button>
          </div>

          <button style={{ marginTop: "10px" }} onClick={logout}>Logout</button>
          {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
        </>
      )}
    </div>
  );
}
