import { createHashRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { AssistantsPage } from './pages/AssistantsPage';
import { CustomersPage } from './pages/CustomersPage';
import { PromptSnippetsPage } from './pages/PromptSnippetsPage';
import { FlowBuilderPage } from './pages/WhatsApp';
import {
  ConversationsPage,
  KnowledgeBasesPage,
  WhatsAppPage,
  WebhooksPage,
  ToolsPage,
  InsightsPage,
  DocumentationPage,
} from './pages';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'insights',
        element: <InsightsPage />,
      },
      {
        path: 'conversations',
        element: <ConversationsPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'assistants',
        element: <AssistantsPage />,
      },
      {
        path: 'knowledge-bases',
        element: <KnowledgeBasesPage />,
      },
      {
        path: 'prompt-snippets',
        element: <PromptSnippetsPage />,
      },
      {
        path: 'tools',
        element: <ToolsPage />,
      },
      {
        path: 'whatsapp',
        element: <WhatsAppPage />,
      },
      {
        path: 'webhooks',
        element: <WebhooksPage />,
      },
      {
        path: 'documentation',
        element: <DocumentationPage />,
      },
    ],
  },
  // Full-screen flow builder — outside Layout (no sidebar/header)
  {
    path: '/whatsapp/flows/:flowId',
    element: <FlowBuilderPage />,
  },
]);
