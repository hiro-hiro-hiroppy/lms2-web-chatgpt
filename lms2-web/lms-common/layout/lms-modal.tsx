'use client';

import { Modal, Box, Typography, Fade, Button, Backdrop } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
};

export default function LmsModal({
  open,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  confirmDisabled = false
}: Props) {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
          {description && <div style={{ marginBottom: 30 }}>{description}</div>}
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>{cancelText}</Button>
            {confirmText && (
              <Button
                onClick={handleConfirm}
                variant="contained"
                color="primary"
                disabled={confirmDisabled}
              >
                {confirmText}
              </Button>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

