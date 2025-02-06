import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Analysis } from '@/pages/Analysis';
import { NotFound } from '@/pages/NotFound';
import { Help } from '@/pages/Help';
import { Tools } from '@/pages/Tools';

// Analysis Components
import { NewAnalysis } from '@/components/analysis/NewAnalysis';
import { ComprehensiveReport } from '@/components/reports/ComprehensiveReport';
import { AutoSummaryView } from '@/components/analysis/AutoSummaryView';
import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { ScenarioSimulation } from '@/components/analysis/ScenarioSimulation';
import { CustomModelView } from '@/components/analysis/CustomModelView';
import { IntegrationsPanel } from '@/components/integrations/IntegrationsPanel';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SettingsView } from '@/components/settings/SettingsView';
import { PredictiveInsights } from '@/components/analysis/PredictiveInsights';

export function Routes() {
  return (
    <BrowserRouter>
      <Layout>
        <RouterRoutes>
          <Route path="/" element={<Dashboard />} />

          {/* Analysis Routes */}
          <Route path="/analysis" element={<Analysis />}>
            <Route path="new" element={<NewAnalysis />} />
            <Route path="reports" element={<ComprehensiveReport />} />
            <Route path="insights" element={<AutoSummaryView />} />
            <Route path="predictions" element={<PredictiveInsights />} />
            <Route path="simulations" element={<ScenarioSimulation />} />
            <Route path=":id" element={<AnalysisResults />} />
          </Route>

          {/* Tools Routes */}
          <Route path="/tools" element={<Tools />}>
            <Route path="models" element={<CustomModelView />} />
            <Route path="integrations" element={<IntegrationsPanel />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>

          {/* Utility Routes */}
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </Layout>
    </BrowserRouter>
  );
}