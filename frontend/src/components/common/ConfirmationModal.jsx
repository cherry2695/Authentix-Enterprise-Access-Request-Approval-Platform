import React, { useState } from 'react';

export const ConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  requiresComment = false,
  commentPlaceholder = 'Enter reason or feedback...'
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!show) return null;

  const handleConfirm = () => {
    if (requiresComment && !comment.trim()) {
      setError('Comments/reason is mandatory for this action.');
      return;
    }
    setError('');
    onConfirm(comment);
    setComment('');
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-dark">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <p className="text-secondary mb-3">{message}</p>

            {(requiresComment || commentPlaceholder) && (
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">
                  Decision Comment / Business Justification {requiresComment && <span className="text-danger">*</span>}
                </label>
                <textarea
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  rows="3"
                  placeholder={commentPlaceholder}
                  value={comment}
                  onChange={e => { setComment(e.target.value); setError(''); }}
                ></textarea>
                {error && <div className="invalid-feedback">{error}</div>}
              </div>
            )}
          </div>
          <div className="modal-footer border-top bg-light rounded-bottom-4">
            <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={`btn btn-${confirmVariant} btn-sm px-4`} onClick={handleConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
