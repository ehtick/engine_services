/* MD
  ## Confirmation modals with top:modal
  ---
  Destructive or irreversible actions — deleting records, overwriting files,
  leaving unsaved changes — should ask the user to confirm before proceeding.
  Opening a custom dialog element from a deeply nested component means threading
  a reference to a controller up through every layer of the tree.

  top-app provides a modal slot that any descendant can trigger by dispatching
  a single DOM event. The modal blocks the UI, shows a configurable message and
  action labels, and calls back into the originating component when the user
  confirms or cancels — no reference to the root element required.

  This tutorial covers showing a modal from a child component by dispatching
  top:modal; setting the label, icon, and button labels; running an async
  confirm handler while the modal shows a loading spinner; and handling the
  cancel path without side effects.

  By the end, you'll have an app where a panel can trigger confirmation dialogs
  for actions of varying severity, each with its own copy and async behaviour.
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

// A child component that triggers modals without holding a reference to top-app.
// It dispatches top:modal and receives the result via onConfirm / onCancel callbacks.
@customElement("modal-actions")
class ModalActions extends LitElement {
  @state() private _lastAction = "—";

  private _confirmDelete() {
    // top:modal opens a blocking dialog on the nearest top-app ancestor.
    // The modal stays open (with a loading spinner) while onConfirm is awaited.
    this.dispatchEvent(
      new CustomEvent("top:modal", {
        bubbles: true,
        composed: true,
        detail: {
          label: "Delete model",
          icon: "tabler:trash",
          confirmLabel: "Delete",
          cancelLabel: "Keep",
          content: html`
            <bim-label style="white-space:normal;">
              This will permanently remove the model and all its versions.
              This action cannot be undone.
            </bim-label>
          `,
          onConfirm: async () => {
            // Simulate an async delete operation.
            // The modal shows a loading spinner until this promise resolves.
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));
            this._lastAction = "Model deleted";
          },
          onCancel: () => {
            this._lastAction = "Delete cancelled";
          },
        },
      }),
    );
  }

  private _confirmOverwrite() {
    this.dispatchEvent(
      new CustomEvent("top:modal", {
        bubbles: true,
        composed: true,
        detail: {
          label: "File already exists",
          icon: "tabler:alert-triangle",
          confirmLabel: "Overwrite",
          cancelLabel: "Cancel",
          content: html`
            <bim-label style="white-space:normal;">
              A file named <strong>structure.ifc</strong> already exists in this
              folder. Uploading will create a new version alongside it.
            </bim-label>
          `,
          // onConfirm can be synchronous too — the modal closes immediately.
          onConfirm: () => {
            this._lastAction = "Overwrite confirmed";
          },
          onCancel: () => {
            this._lastAction = "Overwrite cancelled";
          },
        },
      }),
    );
  }

  render() {
    return html`
      <bim-panel label="Modal Actions">
        <bim-panel-section label="Actions" icon="tabler:click">
          <bim-button
            label="Delete model (async confirm)"
            icon="tabler:trash"
            @click=${this._confirmDelete}
          ></bim-button>
          <bim-button
            label="Overwrite file (sync confirm)"
            icon="tabler:file-upload"
            @click=${this._confirmOverwrite}
          ></bim-button>
          <bim-label>Last action: ${this._lastAction}</bim-label>
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
  panel: () => html`<modal-actions></modal-actions>`,
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
