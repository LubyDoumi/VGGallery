import { onMounted, onUnmounted, type Ref } from "vue";

interface GalleryNavigationButtonOptions {
  moveThreshold?: number;
  longPressDuration?: number;
  onLongPress?: () => void;
  excludeElements?: Ref<HTMLElement | null>[];
}

export function GalleryNavigationButtonComponent(
  imageContainer: Ref<HTMLElement | null>,
  fakeButton: Ref<HTMLDivElement | null>,
  onClick: () => void,
  options: GalleryNavigationButtonOptions = {},
) {
  const {
    moveThreshold = 5,
    longPressDuration = 500,
    onLongPress,
    excludeElements = [],
  } = options;

  /////

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let moved = false;
  let excluded = false;
  let longPressed = false;
  let longPressHandle: ReturnType<typeof setTimeout> | null = null;

  /////

  function CancelLongPress() {
    if (longPressHandle !== null) {
      clearTimeout(longPressHandle);
      longPressHandle = null;
    }
  }

  function IsWithinExcludedElement(posX: number, posY: number): boolean {
    return excludeElements.some((el) => {
      const rect = el.value?.getBoundingClientRect();
      if (!rect) return false;
      return (
        posX >= rect.x &&
        posX <= rect.x + rect.width &&
        posY >= rect.y &&
        posY <= rect.y + rect.height
      );
    });
  }

  function IsWithinFakeButton(posX: number, posY: number): boolean {
    const rect = fakeButton.value?.getBoundingClientRect()!;
    return (
      posX >= rect.x &&
      posX <= rect.x + rect.width &&
      posY >= rect.y &&
      posY <= rect.y + rect.height
    );
  }

  function OnPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;

    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    currentY = e.clientY;
    moved = false;
    excluded = IsWithinExcludedElement(startX, startY);
    longPressed = false;

    if (onLongPress && !excluded) {
      longPressHandle = setTimeout(() => {
        longPressed = true;
        longPressHandle = null;
        if (!moved && IsWithinFakeButton(currentX, currentY)) onLongPress();
      }, longPressDuration);
    }
  }

  function OnPointerMove(e: PointerEvent) {
    currentX = e.clientX;
    currentY = e.clientY;

    const dx = Math.abs(currentX - startX);
    const dy = Math.abs(currentY - startY);

    if (dx > moveThreshold || dy > moveThreshold) {
      moved = true;
    }
  }

  function OnPointerUp(e: PointerEvent) {
    if (e.button !== 0) return;

    CancelLongPress();

    if (moved || longPressed || excluded) return;

    if (IsWithinFakeButton(e.clientX, e.clientY)) {
      onClick();
    }
  }

  /////

  onMounted(() => {
    const el = imageContainer.value!;

    el.addEventListener("pointerdown", OnPointerDown, true);
    el.addEventListener("pointermove", OnPointerMove, true);
    el.addEventListener("pointerup", OnPointerUp, true);
  });

  onUnmounted(() => {
    const el = imageContainer.value;

    if (!el) return;

    el.removeEventListener("pointerdown", OnPointerDown);
    el.removeEventListener("pointermove", OnPointerMove);
    el.removeEventListener("pointerup", OnPointerUp);
  });
}
