import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmModal.css';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Yes, Proceed',
    cancelText = 'Cancel',
    confirmVariant = 'danger',
    icon = 'exclamation-triangle'
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={{ text: title, icon: icon }}
            size="sm"
            footer={
                <>
                    <Button variant={confirmVariant} onClick={handleConfirm} icon="check">
                        {confirmText}
                    </Button>
                    <Button variant="secondary" onClick={onClose} icon="times">
                        {cancelText}
                    </Button>
                </>
            }
        >
            <div className="confirm-modal-content">
                <div className="confirm-icon">
                    <i className={`fas fa-${icon}`}></i>
                </div>
                <p className="confirm-message">{message}</p>
            </div>
        </Modal>
    );
};

export default ConfirmModal;