import { applyPatch } from "json-patch-es6";
import { COMMAND_RENDER, NO_STATE_UPDATE } from "./properties";
import React from "react";
import fetchJsonp from "fetch-jsonp";

/**
 *
 * @param {ExtendedState} extendedState
 * @param {Operation[]} extendedStateUpdateOperations
 * @returns {ExtendedState}
 */
export function applyJSONpatch(extendedState, extendedStateUpdateOperations) {
  // NOTE : we don't validate operations, to avoid throwing errors when for instance the value property for an
  // `add` JSON operation is `undefined` ; and of course we don't mutate the document in place
  return applyPatch(
    extendedState,
    extendedStateUpdateOperations || [],
    false,
    false
  ).newDocument;
}

export function renderAction(params) {
  return {
    outputs: [{ command: COMMAND_RENDER, params }],
    updates: NO_STATE_UPDATE
  };
}

export function runSearchQuery(query) {
  const encodedQuery = encodeURIComponent(query);

  return fetchJsonp(
    `https://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&tags=${encodedQuery}`,
    { jsonpCallback: "jsoncallback" }
  ).then(res => res.json());
}

export function renderGalleryApp(galleryState) {
  return function _renderGalleryApp(extendedState, _, fsmSettings) {
    const { query, items, photo } = extendedState;

    return renderAction({ query, items, photo, gallery: galleryState })
  };
}

export const mergeOutputs = function (accOutputs, outputs) {
  return (accOutputs || []).concat(outputs || []);
};

export function defaultRenderHandler(component, newState, callback) {
  return component.setState(newState, callback);
}

export function destructureEvent(eventStruct) {
  return {
    rawEventName: eventStruct[0],
    rawEventData: eventStruct[1],
    ref: eventStruct[2]
  };
}

