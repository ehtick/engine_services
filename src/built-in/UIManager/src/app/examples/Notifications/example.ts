/* MD
  ## Toasts and cross-component notifications
  ---
  Developers building BIM processing UIs need to surface status updates, errors,
  and async feedback to users from different points in the component tree —
  but reaching back to the app root to trigger a notification from a deeply
  nested component requires threading a reference through every layer in between.

  top-app provides a built-in toast system that any descendant can trigger by
  dispatching a standard DOM event. Toasts are auto-dismissed after a type-based
  duration and stack at the bottom-left of the screen.

  This tutorial covers showing a toast on app boot via showToast; building a
  component that dispatches top:notification to report async progress and
  completion without a reference to the root; and using the four toast types
  (success, error, warning, info) with their respective durations.

  By the end, you'll have an app with a boot confirmation toast and a panel that
  reports async work status without holding any reference to top-app.
*/

import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as BUI from "@thatopen/ui";
import { PlatformClient } from "thatopen-services";
import uiManagerDef from "../../../../index";
import type { App, AppReadyEvent } from "../../index";

// A child component that dispatches top:notification to surface messages
// to the nearest top-app ancestor — no reference to the app element needed.
@customElement("status-reporter")
class StatusReporter extends LitElement {
  @state() private _busy = false;

  private _simulateWork() {
    this._busy = true;

    // Dispatching top:notification from any descendant of top-app shows a toast.
    // bubbles:true + composed:true lets it cross shadow-DOM boundaries.
    this.dispatchEvent(
      new CustomEvent("top:notification", {
        bubbles: true,
        composed: true,
        detail: { message: "Analysis started", type: "info" },
      }),
    );

    setTimeout(() => {
      this._busy = false;
      this.dispatchEvent(
        new CustomEvent("top:notification", {
          bubbles: true,
          composed: true,
          detail: {
            message: "Analysis complete",
            type: "success",
            description: "Found 342 elements across 5 categories.",
          },
        }),
      );
    }, 2000);
  }

  render() {
    return html`
      <bim-panel label="Reporter">
        <bim-panel-section label="Actions" icon="solar:play-bold">
          <bim-button
            label="Run Analysis"
            icon="solar:play-bold"
            .loading=${this._busy}
            @click=${this._simulateWork}
          ></bim-button>
        </bim-panel-section>
      </bim-panel>
    `;
  }
}

// ---- app wiring ----

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
  panel: () => html`<status-reporter></status-reporter>`,
};

app.base = "viewer";
app.layouts = {
  main: {
    label: "Main",
    icon: "solar:home-bold",
    template: `"panel" 1fr / 22rem`,
  },
};
app.layout = "main";

// top:app-ready fires after all waitUntil promises resolve.
// e.detail.app is a reference to the top-app element itself.
app.addEventListener("top:app-ready", (e) => {
  const { app: readyApp } = (e as AppReadyEvent).detail;
  readyApp.showToast("App ready", "success");
});

const container = document.getElementById("that-open-app") ?? document.body;
container.appendChild(app);
document.body.style.margin = "0";
