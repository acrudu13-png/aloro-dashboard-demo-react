import { PlaceholderPage } from './PlaceholderPage';
import { WebhooksPage as WebhooksPageComponent } from './WebhooksPage';
import { KnowledgeBasesPage as KnowledgeBasesPageComponent } from './KnowledgeBasesPage';
import { ToolsPage as ToolsPageComponent } from './ToolsPage';
import { InsightsPage as InsightsPageComponent } from './InsightsPage';

export { ConversationsPage } from './ConversationsPage';

export function KnowledgeBasesPage() {
  return <KnowledgeBasesPageComponent />;
}

export { WhatsAppPage } from './WhatsApp';

export function WebhooksPage() {
  return <WebhooksPageComponent />;
}

export function ToolsPage() {
  return <ToolsPageComponent />;
}

export function InsightsPage() {
  return <InsightsPageComponent />;
}

export function DocumentationPage() {
  return <PlaceholderPage title="Documentation" description="API docs and integration guides" />;
}
