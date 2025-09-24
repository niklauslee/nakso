import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { platform } from "@tauri-apps/plugin-os";

import "../global.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="w-full h-full select-none bg-yellow-200 overflow-clip">
      <div data-tauri-drag-region className="w-full h-8 bg-slate-300">
        <div className="h-full flex justify-center items-center text-sm font-medium pointer-events-none">
          Welcome to Tauri + React
        </div>
      </div>

      <div className="py-4">
        <Button
          variant="outline"
          onClick={async () => {
            const currentPlatform = await platform();
            console.log(currentPlatform);
          }}
        >
          Check Platform (See Console)
        </Button>
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <Button type="submit">Greet</Button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
