import {
  Drawer,
  DrawerActionItem,
  DrawerActionList,
  DrawerAlertItem,
  DrawerAlertList,
  DrawerKeyValueRow,
  DrawerKeyValueTable,
  DrawerParagraph,
  DrawerSection,
  DrawerSectionTitle,
} from '../../components/drawer';

export interface SituationDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const blockers = [
  '3 open comments in revenue section — Sarah Chen',
  'CRM Pipeline Export not loaded — revenue projection provisional',
  'Product Roadmap deck outdated by 6 days',
] as const;

const laterActions = [
  'Refresh the Product Roadmap deck (6 days old)',
  'Request CRM export from IT',
  'NOVA final consistency check before publication',
  'Approve CRM export access with IT',
  'NOVA preparing recommendation draft',
  'Chase vendor NDA',
  'Schedule partner kickoff once legal clears',
] as const;

export function SituationDetailsDrawer({ open, onClose }: SituationDetailsDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Situation details">
      <DrawerSection>
        <DrawerSectionTitle>Summary</DrawerSectionTitle>
        <DrawerParagraph tone="primary">
          The board presentation is the highest priority item. It is 72% complete and blocked by 3
          open comments and 1 missing source. Resolving these raises confidence from 76% to 92% and
          unblocks the CFO review.
        </DrawerParagraph>
      </DrawerSection>

      <DrawerSection>
        <DrawerSectionTitle>Why it matters</DrawerSectionTitle>
        <DrawerParagraph>
          The CFO must review and pre-approve the budget figures before the 18 July board meeting.
          Without his sign-off, the budget decision cannot be made at the meeting.
        </DrawerParagraph>
      </DrawerSection>

      <DrawerSection>
        <DrawerSectionTitle>What is blocking</DrawerSectionTitle>
        <DrawerAlertList>
          {blockers.map((blocker) => (
            <DrawerAlertItem key={blocker}>{blocker}</DrawerAlertItem>
          ))}
        </DrawerAlertList>
      </DrawerSection>

      <DrawerSection>
        <DrawerSectionTitle>Later actions</DrawerSectionTitle>
        <DrawerActionList>
          {laterActions.map((action) => (
            <DrawerActionItem key={action}>{action}</DrawerActionItem>
          ))}
        </DrawerActionList>
      </DrawerSection>

      <DrawerSection>
        <DrawerSectionTitle>Technical details</DrawerSectionTitle>
        <DrawerKeyValueTable>
          <DrawerKeyValueRow label="Documents analysed" value="42" />
          <DrawerKeyValueRow label="Sources validated" value="3 of 4" />
          <DrawerKeyValueRow label="Time saved" value="~6 h" />
          <DrawerKeyValueRow label="Conflicts detected" value="1" />
        </DrawerKeyValueTable>
      </DrawerSection>
    </Drawer>
  );
}
