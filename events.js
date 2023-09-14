/**
 * Registers necessary event listeners for the wheel object.
 * @param {Object} [wheel={}] - The wheel object.
 */
export function register(wheel = {}) {

    registerPointerEvents(wheel);
  
    /**
     * Handler for window resize events.
     * @param {Event} e - Resize event.
     */
    wheel._handler_onResize = e => wheel.resize(e);
    window.addEventListener('resize', wheel._handler_onResize);
  
    // Monitor when the device resolution (devicePixelRatio) changes:
    // See https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
    const updatePixelRatio = () => {
      wheel.resize();
      matchMedia(`(resolution: ${pr}dppx)`)
        .addEventListener('change', updatePixelRatio, { once: true });
    };
  
  }
  
  /**
   * Unregisters the event listeners from the wheel object.
   * @param {Object} [wheel={}] - The wheel object.
   */
  export function unregister(wheel = {}) {
  
    const canvas = wheel.canvas;
  
    if ('PointerEvent' in window) {
      canvas.removeEventListener('pointerdown', wheel._handler_onPointerDown);
      canvas.removeEventListener('pointermove', wheel._handler_onPointerMoveRefreshCursor);
    } else {
      canvas.removeEventListener('touchstart', wheel._handler_onTouchStart);
      canvas.removeEventListener('mousedown', wheel._handler_onMouseDown);
      canvas.removeEventListener('mousemove', wheel._handler_onMouseMoveRefreshCursor);
    }
  
    window.removeEventListener('resize', wheel._handler_onResize);
  
  }
  
  /**
   * Registers pointer-related events for the wheel object.
   * @param {Object} [wheel={}] - The wheel object.
   */
  function registerPointerEvents(wheel = {}) {
    // Adapted from https://glitch.com/~jake-in-the-box
  
    const canvas = wheel.canvas;
  
    /**
     * Handles pointer movement to refresh the cursor.
     * @param {PointerEvent} [e={}] - The pointer event.
     */
    wheel._handler_onPointerMoveRefreshCursor = (e = {}) => {
      const point = {
        x: e.clientX,
        y: e.clientY,
      };
      wheel.isCursorOverWheel = wheel.wheelHitTest(point);
      wheel.refreshCursor();
    };
  
    /**
     * Handles mouse movement to refresh the cursor.
     * @param {MouseEvent} [e={}] - The mouse event.
     */
    wheel._handler_onMouseMoveRefreshCursor = (e = {}) => {
      const point = {
        x: e.clientX,
        y: e.clientY,
      };
      wheel.isCursorOverWheel = wheel.wheelHitTest(point);
      wheel.refreshCursor();
    };
  
    /**
     * Handles the initial touch or click on the wheel.
     * @param {PointerEvent|TouchEvent|MouseEvent} [e={}] - The event.
     */
    wheel._handler_onPointerDown = (e = {}) => {
  
      const point = {
        x: e.clientX,
        y: e.clientY,
      };
  
      if (!wheel.isInteractive) return;
      if (!wheel.wheelHitTest(point)) return;
  
      e.preventDefault();
      wheel.dragStart(point);
      canvas.setPointerCapture(e.pointerId);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('pointerout', onPointerUp);
  
      function onPointerMove(e = {}) {
        e.preventDefault();
        wheel.dragMove({
          x: e.clientX,
          y: e.clientY,
        });
      }
  
      function onPointerUp(e = {}) {
        e.preventDefault();
        canvas.releasePointerCapture(e.pointerId);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        canvas.removeEventListener('pointerout', onPointerUp);
        wheel.dragEnd();
      }
  
    };
  
    /**
     * Handles the initial mouse down event on the wheel.
     * @param {MouseEvent} [e={}] - The mouse event.
     */
    wheel._handler_onMouseDown = (e = {}) => {
  
      const point = {
        x: e.clientX,
        y: e.clientY,
      };
  
      if (!wheel.isInteractive) return;
      if (!wheel.wheelHitTest(point)) return;
  
      wheel.dragStart(point);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  
      function onMouseMove(e = {}) {
        e.preventDefault();
        wheel.dragMove({
          x: e.clientX,
          y: e.clientY,
        });
      }
  
      function onMouseUp(e = {}) {
        e.preventDefault();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        wheel.dragEnd();
      }
  
    };
  
    /**
     * Handles the initial touch start event on the wheel.
     * @param {TouchEvent} [e={}] - The touch event.
     */
    wheel._handler_onTouchStart = (e = {}) => {
  
      const point = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
  
      if (!wheel.isInteractive) return;
      if (!wheel.wheelHitTest(point)) return;
  
      e.preventDefault();
      wheel.dragStart(point);
      canvas.addEventListener('touchmove', onTouchMove);
      canvas.addEventListener('touchend', onTouchEnd);
      canvas.addEventListener('touchcancel', onTouchEnd);
  
      function onTouchMove(e = {}) {
        e.preventDefault();
        wheel.dragMove({
          x: e.targetTouches[0].clientX,
          y: e.targetTouches[0].clientY,
        });
      }
  
      function onTouchEnd(e = {}) {
        e.preventDefault();
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.removeEventListener('touchcancel', onTouchEnd);
        wheel.dragEnd();
      }
  
    };
  
    if ('PointerEvent' in window) {
      canvas.addEventListener('pointerdown', wheel._handler_onPointerDown);
      canvas.addEventListener('pointermove', wheel._handler_onPointerMoveRefreshCursor);
    } else {
      canvas.addEventListener('touchstart', wheel._handler_onTouchStart);
      canvas.addEventListener('mousedown', wheel._handler_onMouseDown);
      canvas.addEventListener('mousemove', wheel._handler_onMouseMoveRefreshCursor);
    }
  
  }
  