import { Suspense } from "react";
import PlayTogether from "./PlayTogether";

export default function Page() {
  return (
    <main>
      <header className="hero">
        <h1>Play Together</h1>
        <p>Paste your friends&apos; Steam profiles and see every multiplayer game you can all play tonight.</p>
      </header>
      <Suspense>
        <PlayTogether />
      </Suspense>
      <footer>
        Not affiliated with Valve. Profiles need <strong>Game details</strong> set to Public in Steam privacy settings.
      </footer>
    </main>
  );
}
