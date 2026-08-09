import { useEffect } from "react";

/**
 * Modern top-right toast notification.
 *
 * Props:
 *  - message: string to show
 *  - type: "success" | "error"
 *  - onClose: fn called when toast should be removed
 *  - duration: ms before auto-close (default 3000)
 */
function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className="toast-wrap">
      <div className={`app-toast ${isSuccess ? "app-toast--success" : "app-toast--error"}`}>
        <div className="app-toast__icon">
          <i className={`bi ${isSuccess ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
        </div>

        <div className="app-toast__body">
          <strong>{isSuccess ? "Success" : "Error"}</strong>
          <span>{message}</span>
        </div>

        <button
          type="button"
          className="app-toast__close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <i className="bi bi-x" />
        </button>

        <div className="app-toast__timer" style={{ animationDuration: `${duration}ms` }} />
      </div>
    </div>
  );
}

export default Toast;
