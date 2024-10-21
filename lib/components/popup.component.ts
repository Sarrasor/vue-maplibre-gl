import {
  defineComponent,
  inject,
  onMounted,
  type PropType,
  onBeforeUnmount,
  watch,
  ref,
  h,
} from "vue";
import {
  type LngLatLike,
  Popup,
  type Offset,
  type PositionAnchor,
} from "maplibre-gl";
import { mapSymbol, markerSymbol } from "@/lib/types";

/**
 * A popup component
 *
 * See [Popup](https://maplibre.org/maplibre-gl-js/docs/API/classes/Popup/).
 */
export default defineComponent({
  name: "MglPopup",
  emits: [
    /**
     * Fired when the popup is opened manually or programmatically.
     */
    "open",
    /**
     * Fired when the popup is closed manually or programmatically.
     */
    "close",
  ],
  props: {
    /**
     * The geographical location of the popup's anchor.
     * Unused when placed inside a marker.
     */
    coordinates: {
      type: [Object, Array] as unknown as PropType<LngLatLike>,
      required: false,
    },
    /**
     * Display a close button in the top right corner.
     */
    closeButton: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },
    /**
     * The popup will be closed when the map is clicked.
     */
    closeOnClick: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },
    /**
     * The popup will be closed when the map moves.
     */
    closeOnMove: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
    /**
     * The popup will try to focus the first focusable element inside the popup.
     */
    focusAfterOpen: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },
    /**
     * A string indicating the part of the Popup that should
     * be positioned closest to the coordinate.
     * Options are `'center'`, `'top'`, `'bottom'`, `'left'`, `'right'`, `'top-left'`,
     * `'top-right'`, `'bottom-left'`, and `'bottom-right'`. If unset the anchor will be
     * dynamically set to ensure the popup falls within the map container with a preference
     * for `'bottom'`.
     */
    anchor: {
      type: String as PropType<PositionAnchor>,
      required: false,
    },
    /**
     * A pixel offset applied to the popup's location
     */
    offset: {
      type: [Number, Object, Array] as PropType<Offset>,
      required: false,
    },
    /**
     * Space-separated CSS class names to add to popup container
     */
    className: {
      type: String as PropType<string>,
      required: false,
    },
    /**
     * A string that sets the CSS property of the popup's maximum width, eg `'300px'`.
     * To ensure the popup resizes to fit its content, set this property to `'none'`.
     */
    maxWidth: {
      type: String as PropType<string>,
      default: "240px",
    },
    /**
     * If true, rounding is disabled for placement of the popup, allowing for subpixel positioning and smoother movement when the popup is translated.
     * @since 7.1.0
     */
    subpixelPositioning: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /**
     * Sets the popup's content to a string of text.
     */
    text: {
      type: String as PropType<string>,
      required: false,
    },
  },
  setup(props, { slots, emit, expose }) {
    const map = inject(mapSymbol);
    const marker = inject(markerSymbol, undefined);
    const root = ref();

    const popup = new Popup(props);

    if (marker && marker.value) {
      marker.value.setPopup(popup);
    } else if (props.coordinates && map) {
      popup.setLngLat(props.coordinates).addTo(map.value!);
    }

    if (props.text) {
      popup.setText(props.text);
    }

    function emitEvent(eventName: "close" | "open") {
      const fn = () => emit(eventName);
      popup.on(eventName, fn);
      onBeforeUnmount(() => {
        popup.off(eventName, fn);
      });
    }

    emitEvent("open");
    emitEvent("close");

    expose({
      remove() {
        popup.remove();
      },
    });

    watch(
      () => props.coordinates,
      (v) => {
        if (v) {
          popup.setLngLat(v);
        }
      },
      { deep: true },
    );
    watch(
      () => props.text,
      (v) => popup.setText(v || ""),
    );
    watch(
      () => props.offset,
      (v) => popup.setOffset(v),
    );
    watch(
      () => props.maxWidth,
      (v) => popup.setMaxWidth(v),
    );
    watch(
      () => props.className,
      (value, previous) => {
        if (previous) {
          popup.removeClassName(previous);
        }
        if (value) {
          popup.addClassName(value);
        }
      },
    );
    watch(
      () => props.subpixelPositioning,
      (v) => popup.setSubpixelPositioning(v),
    );

    onMounted(() => {
      if (root.value && !props.text) {
        popup.setDOMContent(root.value!);
      }
    });

    onBeforeUnmount(() => {
      popup.remove();
    });

    return () => [
      h("div", { ref: root }, slots.default ? slots.default() : undefined),
    ];
  },
  /**
   * Slot for popup content
   * @slot default
   */
  render() {
    return null;
  },
});
