import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';

const ModalOverlay = styled('div')(({ show }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
  opacity: show ? 1 : 0,
  visibility: show ? 'visible' : 'hidden',
  transition: 'opacity 0.2s ease-out, visibility 0.2s ease-out',
  boxSizing: 'border-box',
  overflowY: 'auto',
  
  '@media (max-width: 768px)': {
    padding: '8px',
    alignItems: 'flex-start',
    paddingTop: '20px'
  }
}));

const ModalContent = styled('div')(({ show }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '800px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  transform: show ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
  transition: 'transform 0.2s ease-out',
  position: 'relative',
  margin: 'auto',
  boxSizing: 'border-box',
  
  '@media (max-width: 768px)': {
    maxWidth: '100%',
    maxHeight: '95vh',
    borderRadius: '12px 12px 0 0',
    margin: 0
  }
}));

const ModalHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px 16px',
  borderBottom: '1px solid #f3f4f6',
  flexShrink: 0,
  
  '@media (max-width: 768px)': {
    padding: '16px 20px 12px'
  }
});

const ModalTitle = styled('h2')({
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#000000',
  fontFamily: '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  lineHeight: 1.3,
  
  '@media (max-width: 768px)': {
    fontSize: '1.125rem'
  }
});

const CloseButton = styled('button')({
  background: 'none',
  border: 'none',
  padding: '8px',
  cursor: 'pointer',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6b7280',
  transition: 'background-color 0.15s ease, color 0.15s ease',
  
  '&:hover': {
    backgroundColor: '#f3f4f6',
    color: '#000000'
  },
  
  '&:focus': {
    outline: '2px solid #3b82f6',
    outlineOffset: '2px'
  },
  
  '& svg': {
    width: '20px',
    height: '20px'
  }
});

const ModalBody = styled('div')({
  padding: '0 24px 24px',
  overflow: 'auto',
  flexGrow: 1,
  flexShrink: 1,
  minHeight: 0,
  
  '@media (max-width: 768px)': {
    padding: '0 20px 20px'
  }
});

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay show={isOpen} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent show={isOpen}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;