import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Machine } from "react-state-driven"
import { imageGalleryFsmDef } from "./imageGalleryFsm";
import { imageGalleryReactMachineDef } from "./imageGalleryReactMachineDef";
import h from "react-hyperscript";
import { createStateMachine, decorateWithEntryActions, fsmContracts } from "state-transducer";

// TODO: use a emitonoff emitter? no, first, use the rx adapter which is trivial enough
// then clone the repertory or codesandbox and show the emitonoff adapter instead
const fsmSpecsWithEntryActions = decorateWithEntryActions(
  imageGalleryFsmDef,
  imageGalleryFsmDef.entryActions,
  null
);
const fsm = createStateMachine(
  fsmSpecsWithEntryActions,
  { debug: { console, checkContracts: fsmContracts } }
);

ReactDOM.render(
  h(Machine, Object.assign({}, imageGalleryReactMachineDef, { fsm }), []),
  document.getElementById("root")
);
