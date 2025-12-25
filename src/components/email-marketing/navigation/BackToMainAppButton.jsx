// src/components/email-marketing/navigation/BackToMainAppButton.jsx

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./backToMainAppButton.css";

export default function BackToMainAppButton({
  hasUnsavedChanges = false
}) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowConfirm(true);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const confirmExit = () => {
    setShowConfirm(false);
    navigate("/admin/dashboard");
  };

  return (
    <>
      <button
        className="em-back-main-btn"
        onClick={handleBack}
        title="Return to Admin Dashboard"
        aria-label="Back to main admin dashboard"
      >
        ← Back to Main App
      </button>

      {showConfirm && (
        <div className="em-confirm-overlay">
          <div className="em-confirm-modal">
            <h3>Unsaved Changes</h3>
            <p>
              You have unsaved changes in Email Marketing.
              Leaving now may discard them.
            </p>

            <div className="em-confirm-actions">
              <button
                className="em-confirm-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Stay
              </button>
              <button
                className="em-confirm-leave"
                onClick={confirmExit}
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
