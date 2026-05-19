import { ref, onMounted, onUnmounted, type Ref, reactive, Reactive } from "vue";
import { VGImageZoomData } from "../VGImageZoomData";

interface GalleryZoomOptions {
  maxScale?: number;
}

export type GalleryZoomController = {
  ZoomScale: Ref<number>;
  PanX: Ref<number>;
  PanY: Ref<number>;
  Reset: () => void;
  GetZoomData: () => VGImageZoomData;
  SetZoomData: (data: VGImageZoomData) => void;
  RefreshClamp: () => void;
  OnOrientationChanges: (
    listener: (prev: OrientationType, curr: OrientationType) => void,
  ) => void;
};

export function GalleryZoomComponent(
  containerRef: Ref<HTMLElement | null>,
  options: GalleryZoomOptions = {},
): Reactive<GalleryZoomController> {
  const { maxScale = 5 } = options;

  /////

  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);

  /////

  let initialDistance = 0;
  let initialScale = 1;
  let initialMidpoint = { x: 0, y: 0 };
  let initialTranslate = { x: 0, y: 0 };
  let isPanning = false;
  let lastPointer = { x: 0, y: 0 };
  let isSinglePanning = false;
  let lastTouch = { x: 0, y: 0 };

  let currentOrientation = screen.orientation.type;

  /////

  let OnOrientationChanges:
    | null
    | ((prev: OrientationType, curr: OrientationType) => void) = null;

  /////

  function GetDistanceBetweenTouches(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.hypot(dx, dy);
  }

  function GetMidpointOnTouches(touches: TouchList, rect: DOMRect) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
      y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
    };
  }

  /**
   * Clamp the image inside the container, accounting for object-fit: contain letterboxing.
   * The image element fills the container but the visible image content may be smaller,
   * centered with blank bars on two sides. We clamp based on content bounds, not element bounds.
   */
  function ClampTranslate(newScale: number) {
    const container = containerRef.value!;
    const image = container?.children[1]! as HTMLImageElement;
    const cW = container.offsetWidth;
    const cH = container.offsetHeight;

    const naturalImgW = image.naturalWidth || cW;
    const naturalImgH = image.naturalHeight || cH;
    const fitScale = Math.min(cW / naturalImgW, cH / naturalImgH);
    const renderedW = naturalImgW * fitScale;
    const renderedH = naturalImgH * fitScale;
    const offsetX = (cW - renderedW) / 2;
    const offsetY = (cH - renderedH) / 2;

    const scaledW = renderedW * newScale;
    const scaledH = renderedH * newScale;

    translateX.value =
      scaledW < cW
        ? (cW - scaledW) / 2 - offsetX * newScale
        : Math.min(
            -offsetX * newScale,
            Math.max(cW - (offsetX + renderedW) * newScale, translateX.value),
          );

    translateY.value =
      scaledH < cH
        ? (cH - scaledH) / 2 - offsetY * newScale
        : Math.min(
            -offsetY * newScale,
            Math.max(cH - (offsetY + renderedH) * newScale, translateY.value),
          );
  }

  function RefreshClamp() {
    ClampTranslate(scale.value);
  }

  function Reset() {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  }

  function GetZoomData(): VGImageZoomData {
    return new VGImageZoomData(scale.value, translateX.value, translateY.value);
  }

  function SetZoomData(zoomData: VGImageZoomData) {
    scale.value = zoomData.Scale;
    translateX.value = zoomData.X;
    translateY.value = zoomData.Y;
  }

  function RegisterOnOrientationChanges(
    listener: (prev: OrientationType, curr: OrientationType) => void,
  ): void {
    OnOrientationChanges = listener;
  }

  /////

  function OnTouchStart(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Zoom start
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      initialDistance = GetDistanceBetweenTouches(e.touches);
      initialScale = scale.value;
      initialMidpoint = GetMidpointOnTouches(e.touches, rect);
      initialTranslate = { x: translateX.value, y: translateY.value };
      isSinglePanning = false;
    } else if (e.touches.length === 1 && scale.value > 1) {
      // Pan start

      isSinglePanning = true;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function OnToucheMove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 2) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const distance = GetDistanceBetweenTouches(e.touches);
      const rawScale = initialScale * (distance / initialDistance);

      isSinglePanning = false;
      scale.value = Math.min(maxScale, Math.max(1, rawScale));

      const midpoint = GetMidpointOnTouches(e.touches, rect);
      const scaleRatio = scale.value / initialScale;

      translateX.value =
        midpoint.x - scaleRatio * (initialMidpoint.x - initialTranslate.x);
      translateY.value =
        midpoint.y - scaleRatio * (initialMidpoint.y - initialTranslate.y);

      ClampTranslate(scale.value);
    } else if (e.touches.length === 1 && isSinglePanning) {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;

      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      translateX.value += dx;
      translateY.value += dy;

      ClampTranslate(scale.value);
    }
  }

  function OnTouchEnd(e: TouchEvent) {
    if (e.touches.length < 2) {
      initialDistance = 0;
      isSinglePanning = false;
    }
  }

  /**
   * Handle zoom with mouse wheel.
   */
  function OnWheel(e: WheelEvent) {
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const zoomFactor = 1 - e.deltaY * 0.01;
    const newScale = Math.min(maxScale, Math.max(1, scale.value * zoomFactor));
    const scaleRatio = newScale / scale.value;

    translateX.value = cursorX - scaleRatio * (cursorX - translateX.value);
    translateY.value = cursorY - scaleRatio * (cursorY - translateY.value);
    scale.value = newScale;

    ClampTranslate(newScale);
  }

  function OnPointerDown(e: PointerEvent) {
    if (e.pointerType === "touch") return;
    if (scale.value === 1) return;

    isPanning = true;
    lastPointer = { x: e.clientX, y: e.clientY };
  }

  function OnPointerMove(e: PointerEvent) {
    if (!isPanning) return;

    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;

    lastPointer = { x: e.clientX, y: e.clientY };
    translateX.value += dx;
    translateY.value += dy;

    ClampTranslate(scale.value);
  }

  function OnPointerUp() {
    isPanning = false;
  }

  function OnScreenOrientationChange(e: Event) {
    const previous = currentOrientation;
    currentOrientation = screen.orientation.type;

    if (OnOrientationChanges !== null)
      OnOrientationChanges(previous, currentOrientation);
  }

  /////

  onMounted(() => {
    const el = containerRef.value;

    if (!el) return;

    el.addEventListener("touchstart", OnTouchStart, { passive: false });
    el.addEventListener("touchmove", OnToucheMove, { passive: false });
    el.addEventListener("touchend", OnTouchEnd);
    el.addEventListener("wheel", OnWheel, { passive: false });
    el.addEventListener("pointerdown", OnPointerDown);
    el.addEventListener("pointermove", OnPointerMove);
    el.addEventListener("pointerup", OnPointerUp);
    el.addEventListener("pointerleave", OnPointerUp);

    screen.orientation.addEventListener("change", OnScreenOrientationChange);
  });

  onUnmounted(() => {
    const el = containerRef.value;

    if (!el) return;

    el.removeEventListener("touchstart", OnTouchStart);
    el.removeEventListener("touchmove", OnToucheMove);
    el.removeEventListener("touchend", OnTouchEnd);
    el.removeEventListener("wheel", OnWheel);
    el.removeEventListener("pointerdown", OnPointerDown);
    el.removeEventListener("pointermove", OnPointerMove);
    el.removeEventListener("pointerup", OnPointerUp);
    el.removeEventListener("pointerleave", OnPointerUp);

    screen.orientation.removeEventListener("change", OnScreenOrientationChange);
  });

  return reactive({
    ZoomScale: scale,
    PanX: translateX,
    PanY: translateY,
    Reset: Reset,
    GetZoomData: GetZoomData,
    SetZoomData: SetZoomData,
    RefreshClamp: RefreshClamp,
    OnOrientationChanges: RegisterOnOrientationChanges,
  });
}
