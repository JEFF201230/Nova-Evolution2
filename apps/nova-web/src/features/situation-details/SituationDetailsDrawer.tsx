import {
  Drawer,
  DrawerParagraph,
  DrawerSection,
  DrawerSectionTitle,
} from '../../components/drawer';

export interface SituationDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SituationDetailsDrawer({ open, onClose }: SituationDetailsDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Situation details">
      <DrawerSection>
        <DrawerSectionTitle>Unavailable</DrawerSectionTitle>
        <DrawerParagraph tone="primary">
          Situation details are not available from the canonical Home Runtime contract.
        </DrawerParagraph>
        <DrawerParagraph>
          Home does not infer blockers, confidence, sources, actions, or impact from Active Work.
        </DrawerParagraph>
      </DrawerSection>
    </Drawer>
  );
}
