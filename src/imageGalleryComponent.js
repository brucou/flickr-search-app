import React from "react";
import h from "react-hyperscript";
import hyperscript from "hyperscript-helpers";
import "./gallery.scss";

const { div, button, span, input, form, section, img, h1 } = hyperscript(h);

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  render() {
    const Component = this;
    const { galleryState, onSubmit, onClick } = Component.props;

    const searchText = {
      loading: "Searching...",
      error: "Try search again",
      start: "Search"
    }[galleryState] || "Search";
    const isLoading = galleryState === "loading";

    return form(".ui-form", { onSubmit: ev => onSubmit(ev, this.formRef) }, [
      input(".ui-input", {
        ref: this.formRef,
        type: "search",
        placeholder: "Search Flickr for photos...",
        disabled: isLoading
      }),
      div(".ui-buttons", [
        button(
          ".ui-button",
          { disabled: isLoading, "data-flip-key": "search" },
          searchText
        ),
        isLoading &&
        button(
          ".ui-button",
          {
            type: "button",
            onClick: onClick
          },
          "Cancel"
        )
      ])
    ]);
  }
}

function Gallery(props) {
  const { galleryState, items, onClick } = props;
  const isError = galleryState === "error";

  return section(".ui-items", { "data-state": galleryState }, [
    isError
      ? span(".ui-error", `Uh oh, search failed.`)
      : items.map((item, i) =>
        img(".ui-item", {
          src: item.media.m,
          style: { "--i": i },
          key: item.link,
          onClick: ev => onClick(item)
        })
      )
  ]);
}

function Photo(props) {
  // NOTE: by machine construction, `photo` exists and is not null
  const { galleryState, onClick, photo } = props;

  if (galleryState !== "photo") return null;

  return section(".ui-photo-detail", { onClick }, [
    img(".ui-photo", { src: photo.media.m })
  ]);
}

export function GalleryApp(props) {
  // NOTE: `query` is not used! :-) Because we use a uncontrolled component, we need not use query
  const { query, photo, items, next, gallery: galleryState } = props;

  return div(".ui-app", { "data-state": galleryState }, [
    h(
      Form,
      {
        galleryState,
        onSubmit: (ev, formRef) => next(["onSubmit", ev, formRef]),
        onClick: ev => next(["onCancelClick"])
      },
      []
    ),
    h(
      Gallery,
      { galleryState, items, onClick: item => next(["onGalleryClick", item]) },
      []
    ),
    h(Photo, { galleryState, photo, onClick: ev => next(["onPhotoClick"]) }, [])
  ]);
}
