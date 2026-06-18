/* MD
  ## Persistent banners with top:banner
  ---
  Some application states need a persistent, visible indicator that stays on
  screen until the state is explicitly cleared — an archived-files mode, a
  read-only permission warning, a degraded-connectivity notice. A toast
  auto-dismisses after a few seconds, which is wrong for these cases. A modal
  blocks interaction entirely, which is too heavy.

  top-app provides a banner slot at the top of the layout that occupies real
  space (pushes content down) and stays visible until dismissed programmatically.
  Any descendant component can show or hide it by dispatching standard DOM events
  — no reference to the root element required.

  This tutorial covers showing a banner from a child component by dispatching
  top:banner; customising the banner type, icon, message, and description;
  making a banner user-dismissible with the dismissible flag; and hiding it
  programmatically with top:banner:hide.

  By the end, you'll have an app where a panel can activate and deactivate a
  persistent banner that pushes the layout content down while it is visible.
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
import type { App } from "../../index";

// A child component that controls a banner without holding a reference to top-app.
// It dispatches top:banner to show and top:banner:hide to remove it.
@customElement("banner-controller")
class BannerController extends LitElement {
  @state() private _active = false;

  private _showReadOnly() {
    this._active = true;

    // top:banner shows a persistent bar at the top of the nearest top-app ancestor.
    // It replaces any existing banner — only one banner is shown at a time.
    this.dispatchEvent(
      new CustomEvent("top:banner", {
        bubbles: true,
        composed: true,
        detail: {
          type: "warning",
          icon: "tabler:lock",
          message: "Read-only mode",
          description: "You do not have write permissions on this project.",
          // dismissible:true adds a close button on the banner itself.
          // Omit it (or set false) when the banner must only be cleared by code.
          dismissible: true,
        },
      }),
    );
  }

  private _showArchived() {
    this._active = true;

    // Calling top:banner again replaces the previous banner immediately.
    this.dispatchEvent(
      new CustomEvent("top:banner", {
        bubbles: true,
        composed: true,
        detail: {
          type: "warning",
          icon: "tabler:archive",
          message: "Viewing archived files",
          description: "Archived items are permanently deleted after 30 days.",
          // No dismissible — this banner should only be cleared when the mode exits.
        },
      }),
    );
  }

  private _hide() {
    this._active = false;

    // top:banner:hide clears the current banner unconditionally.
    this.dispatchEvent(
      new CustomEvent("top:banner:hide", { bubbles: true, composed: true }),
    );
  }

  render() {
    return html`
      <bim-panel label="Banner Controller">
        <bim-panel-section label="Banners" icon="tabler:message">
          <bim-button
            label="Show read-only banner (dismissible)"
            icon="tabler:lock"
            @click=${this._showReadOnly}
          ></bim-button>
          <bim-button
            label="Show archived banner (programmatic only)"
            icon="tabler:archive"
            @click=${this._showArchived}
          ></bim-button>
          <bim-button
            label="Hide banner"
            icon="tabler:x"
            ?disabled=${!this._active}
            @click=${this._hide}
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
  panel: () => html`<banner-controller></banner-controller>`,
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

const container = document.getElementById("that-open-app") ?? document.body;
container.appendChild(app);
document.body.style.margin = "0";
