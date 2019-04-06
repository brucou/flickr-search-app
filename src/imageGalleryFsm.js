import { NO_OUTPUT } from "state-transducer";
import { COMMAND_SEARCH, NO_ACTIONS, NO_STATE_UPDATE } from "./properties";
import { applyJSONpatch, renderAction, renderGalleryApp } from "./helpers";

export const imageGalleryFsmDef = {
  events: [
    "START",
    "SEARCH",
    "SEARCH_SUCCESS",
    "SEARCH_FAILURE",
    "CANCEL_SEARCH",
    "SELECT_PHOTO",
    "EXIT_PHOTO"
  ],
  states: { init: "", start: "", loading: "", gallery: "", error: "", photo: "" },
  initialControlState: "init",
  initialExtendedState: {
    query: "",
    items: [],
    photo: undefined,
    gallery: ""
  },
  transitions: [
    { from: "init", event: "START", to: "start", action: NO_ACTIONS },
    { from: "start", event: "SEARCH", to: "loading", action: NO_ACTIONS },
    {
      from: "loading",
      event: "SEARCH_SUCCESS",
      to: "gallery",
      action: (extendedState, eventData, fsmSettings) => {
        const items = eventData;

        return {
          updates: [{ op: "add", path: "/items", value: items }],
          outputs: NO_OUTPUT
        };
      }
    },
    {
      from: "loading",
      event: "SEARCH_FAILURE",
      to: "error",
      action: NO_ACTIONS
    },
    {
      from: "loading",
      event: "CANCEL_SEARCH",
      to: "gallery",
      action: NO_ACTIONS
    },
    { from: "error", event: "SEARCH", to: "loading", action: NO_ACTIONS },
    { from: "gallery", event: "SEARCH", to: "loading", action: NO_ACTIONS },
    {
      from: "gallery",
      event: "SELECT_PHOTO",
      to: "photo",
      action: (extendedState, eventData, fsmSettings) => {
        const item = eventData;

        return {
          updates: [{ op: "add", path: "/photo", value: item }],
          outputs: NO_OUTPUT
        };
      }
    },
    { from: "photo", event: "EXIT_PHOTO", to: "gallery", action: NO_ACTIONS }
  ],
  entryActions: {
    loading: (extendedState, eventData, fsmSettings) => {
      const { items, photo } = extendedState;
      const query = eventData;
      const searchCommand = {
        command: COMMAND_SEARCH,
        params: query
      };
      const renderGalleryAction = renderAction({ query, items, photo, gallery: "loading" });

      return {
        outputs: [searchCommand].concat(renderGalleryAction.outputs),
        updates: NO_STATE_UPDATE
      };
    },
    photo: renderGalleryApp("photo"),
    gallery: renderGalleryApp("gallery"),
    error: renderGalleryApp("error"),
    start: renderGalleryApp("start")
  },
  updateState: applyJSONpatch,
}

