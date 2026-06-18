/* MD
  ## File drag-and-drop with top:files-dropped
  ---
  Desktop BIM workflows often rely on dragging files straight from the OS file
  manager onto the browser window — but wiring a document-level dragenter,
  dragover, dragleave, and drop handler that correctly tracks nested enter/leave
  counts, shows a visual overlay, and forwards the files to the right component
  is tedious boilerplate to repeat for every app.

  top-app handles all of that automatically. It listens for file drag events on
  the document, shows a configurable overlay while files are in flight, and fires
  a single top:files-dropped event when the user releases the files. The drop
  message can be a static string or a function evaluated at render time, so it
  can reflect live application state.

  This tutorial covers receiving dropped files via top:files-dropped; filtering
  them by extension and surfacing a warning when none are supported; setting
  dropMessage as a function that reads a live model counter so the hint text
  updates as models are loaded; and showing a toast on success using the
  top:notification event from the same handler.

  By the end, you'll have an app with a drag-and-drop zone whose overlay message
  adapts to how many models are already loaded, and that reports unsupported
  files with a warning toast.
*/

import { html } from "lit";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";
import { PlatformClient } from "thatopen-services";
import uiManagerDef from "../../../../index";
import type { App, AppReadyEvent } from "../../index";

const UIManager = uiManagerDef.componentDefinition;
const client = PlatformClient.fromPlatformContext();
const { components } = (await client.setup(
  { OBC, OBF, BUI, THREE, FRAGS },
  { uuid: UIManager.uuid },
)) as { components: OBC.Components };
components.get(UIManager).init();

const app = document.createElement("top-app") as unknown as App;

app.setup = (waitUntil) => {
  waitUntil(
    (async () => {
      const fragments = components.get(OBC.FragmentsManager);
      const workerUrl = await FRAGS.FragmentsModels.getWorker();
      fragments.init(await FRAGS.toClassicWorker(workerUrl), {
        classicWorker: true,
      });
    })(),
    "Fragments Core",
  );
  return { components, client };
};

app.elements = {
  viewer: () =>
    html`<top-viewer><top-viewer-tools></top-viewer-tools></top-viewer>`,
};

app.base = "viewer";
app.layouts = {
  main: {
    label: "Main",
    icon: "solar:home-bold",
    template: `"_" 1fr / 1fr`,
  },
};
app.layout = "main";

// dropMessage as a function is evaluated at render time so it can read live state.
// Here it reads how many models are already loaded and adjusts the hint text.
let loadedCount = 0;
app.dropMessage = () =>
  loadedCount === 0
    ? "Drop an IFC or FRAG file to load your first model"
    : `Drop a file to add to the ${loadedCount} loaded model${loadedCount === 1 ? "" : "s"}`;

// top:files-dropped fires when the user drops files onto the window.
// e.detail.files is a File[]. Handle upload, load, or validation here.
app.addEventListener("top:files-dropped", (e) => {
  const { files } = (e as CustomEvent<{ files: File[] }>).detail;

  const supported = files.filter(
    (f) => f.name.endsWith(".ifc") || f.name.endsWith(".frag"),
  );

  // Dispatch top:notification to surface feedback without a reference to top-app.
  if (!supported.length) {
    app.dispatchEvent(
      new CustomEvent("top:notification", {
        bubbles: true,
        composed: true,
        detail: { message: "No supported files dropped", type: "warning" },
      }),
    );
    return;
  }

  loadedCount += supported.length;
  app.dispatchEvent(
    new CustomEvent("top:notification", {
      bubbles: true,
      composed: true,
      detail: {
        message: `${supported.length} file${supported.length === 1 ? "" : "s"} received`,
        type: "success",
        description: supported.map((f) => f.name).join(", "),
      },
    }),
  );
});

app.addEventListener("top:app-ready", (e) => {
  const { app: readyApp } = (e as AppReadyEvent).detail;
  readyApp.showToast("App ready — try dropping an IFC or FRAG file", "info");
});

const container = document.getElementById("that-open-app") ?? document.body;
container.appendChild(app);
document.body.style.margin = "0";
