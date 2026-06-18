import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';

import { BaseModal, type BaseModalVariant } from '@/components/ui/BaseModal';
import { SPLIT_LAYOUT_MIN_WIDTH } from '@/constants/layout';

type AdminFeatureModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function AdminFeatureModal({
  visible,
  title,
  description,
  onClose,
  children,
}: AdminFeatureModalProps) {
  const { width } = useWindowDimensions();
  const variant: BaseModalVariant = width >= SPLIT_LAYOUT_MIN_WIDTH ? 'centered' : 'sheet';

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BaseModal
      description={description}
      maxWidth={720}
      title={title}
      variant={variant}
      visible={visible}
      onClose={handleClose}>
      {children}
    </BaseModal>
  );
}
