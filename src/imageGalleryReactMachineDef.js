import { COMMAND_RENDER, COMMAND_SEARCH, NO_INTENT } from "./properties"
import { filter, map, startWith } from "rxjs/operators"
import { runSearchQuery, destructureEvent } from "./helpers"
import { INIT_EVENT } from "state-transducer"
import { Subject } from "rxjs/index"
import { GalleryApp } from "./imageGalleryComponent"
import Flipping from "flipping"
import React from "react";

const flipping = new Flipping();
const stateTransducerRxAdapter = {
  subjectFactory : () => new Subject()
};

export const imageGalleryReactMachineDef = {
  options: { },
  renderWith: GalleryApp,
  eventHandler: stateTransducerRxAdapter,
  preprocessor: rawEventSource =>
    rawEventSource.pipe(
      map(ev => {
        const { rawEventName, rawEventData: e, ref } = destructureEvent(ev);

        if (rawEventName === INIT_EVENT) {
          return { [INIT_EVENT]: void 0 };
        }
        // Form raw events
        else if (rawEventName === "START") {
          return { START: void 0 };
        } else if (rawEventName === "onSubmit") {
          e.persist();
          e.preventDefault();
          return { SEARCH: ref.current.value };
        } else if (rawEventName === "onCancelClick") {
          return { CANCEL_SEARCH: void 0 };
        }
        // Gallery
        else if (rawEventName === "onGalleryClick") {
          const item = e;
          return { SELECT_PHOTO: item };
        }
        // Photo detail
        else if (rawEventName === "onPhotoClick") {
          return { EXIT_PHOTO: void 0 };
        }
        // System events
        else if (rawEventName === "SEARCH_SUCCESS") {
          const items = e;
          return { SEARCH_SUCCESS: items };
        } else if (rawEventName === "SEARCH_FAILURE") {
          return { SEARCH_FAILURE: void 0 };
        }

        return NO_INTENT;
      }),
      filter(x => x !== NO_INTENT),
      startWith({ START: void 0 })
    ),
  commandHandlers: {
    [COMMAND_SEARCH]: (next, query, effectHandlers) => {
      effectHandlers
        .runSearchQuery(query)
        .then(data => {
          next("SEARCH_SUCCESS")(data.items);
        })
        .catch(error => {
          next("SEARCH_FAILURE")(void 0);
        });
    }
  },
  effectHandlers: {
    runSearchQuery: runSearchQuery,
    [COMMAND_RENDER]: (machineComponent, renderWith, params, next) => {
      // Applying flipping animations : read DOM before render, and flip after render
      flipping.read();
      machineComponent.setState(
        { render: React.createElement(renderWith, Object.assign({}, params, { next }), []) },
        () => flipping.flip()
      );
    }
  }
};
