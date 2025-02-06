/*
  # Industry Categories and Templates Migration
  
  1. New Tables
    - industry_categories: Industry-specific categories and metrics schemas
    - industry_metrics: Industry-specific performance metrics
    - industry_benchmarks: Industry benchmark data
    - analysis_templates: Pre-configured analysis templates
  
  2. Changes
    - Add industry category reference to workspaces table
  
  3. Security
    - Enable RLS on all new tables
    - Add appropriate access policies
*/

-- Create industry categories table
CREATE TABLE public.industry_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  metrics_schema jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create industry metrics table
CREATE TABLE public.industry_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.industry_categories ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  unit text,
  calculation_method text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create industry benchmarks table
CREATE TABLE public.industry_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.industry_categories ON DELETE CASCADE,
  metric_id uuid REFERENCES public.industry_metrics ON DELETE CASCADE,
  value numeric NOT NULL,
  percentile numeric,
  region text,
  year integer,
  source text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create analysis templates table
CREATE TABLE public.analysis_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.industry_categories ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  configuration jsonb NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add industry category to workspaces
ALTER TABLE public.workspaces 
ADD COLUMN category_id uuid REFERENCES public.industry_categories;

-- Enable RLS
ALTER TABLE public.industry_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_templates ENABLE ROW LEVEL SECURITY;

-- Industry Categories Policies
CREATE POLICY "Everyone can view industry categories"
  ON public.industry_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Industry Metrics Policies
CREATE POLICY "Everyone can view industry metrics"
  ON public.industry_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Industry Benchmarks Policies
CREATE POLICY "Everyone can view industry benchmarks"
  ON public.industry_benchmarks
  FOR SELECT
  TO authenticated
  USING (true);

-- Analysis Templates Policies
CREATE POLICY "Users can view public templates and their own"
  ON public.analysis_templates
  FOR SELECT
  TO authenticated
  USING (
    is_public OR created_by = auth.uid()
  );

CREATE POLICY "Users can create templates"
  ON public.analysis_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Template owners can update their templates"
  ON public.analysis_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_template_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER template_update_timestamp
  BEFORE UPDATE ON public.analysis_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_template_update();

-- Insert initial industry categories
DO $$ 
DECLARE
  healthcare_id uuid;
  retail_id uuid;
  finance_id uuid;
  admin_id uuid;
BEGIN
  -- Get the first admin user's ID
  SELECT id INTO admin_id FROM auth.users LIMIT 1;

  -- Insert categories
  INSERT INTO public.industry_categories (name, description, metrics_schema) VALUES
    (
      'Healthcare',
      'Healthcare and medical services industry',
      '{
        "required": ["patient_outcomes", "readmission_rate", "treatment_effectiveness"],
        "properties": {
          "patient_outcomes": {
            "type": "object",
            "properties": {
              "success_rate": {"type": "number"},
              "recovery_time": {"type": "number"},
              "satisfaction": {"type": "number"}
            }
          },
          "readmission_rate": {"type": "number"},
          "treatment_effectiveness": {
            "type": "object",
            "properties": {
              "success_rate": {"type": "number"},
              "side_effects": {"type": "array"}
            }
          }
        }
      }'
    ) RETURNING id INTO healthcare_id;

  INSERT INTO public.industry_categories (name, description, metrics_schema) VALUES
    (
      'Retail',
      'Retail and e-commerce industry',
      '{
        "required": ["sales_performance", "inventory_metrics", "customer_metrics"],
        "properties": {
          "sales_performance": {
            "type": "object",
            "properties": {
              "revenue": {"type": "number"},
              "growth_rate": {"type": "number"},
              "average_order_value": {"type": "number"}
            }
          },
          "inventory_metrics": {
            "type": "object",
            "properties": {
              "turnover_rate": {"type": "number"},
              "stock_level": {"type": "number"},
              "out_of_stock_rate": {"type": "number"}
            }
          },
          "customer_metrics": {
            "type": "object",
            "properties": {
              "retention_rate": {"type": "number"},
              "satisfaction_score": {"type": "number"},
              "lifetime_value": {"type": "number"}
            }
          }
        }
      }'
    ) RETURNING id INTO retail_id;

  INSERT INTO public.industry_categories (name, description, metrics_schema) VALUES
    (
      'Finance',
      'Financial services and banking industry',
      '{
        "required": ["risk_metrics", "performance_metrics", "compliance_metrics"],
        "properties": {
          "risk_metrics": {
            "type": "object",
            "properties": {
              "var": {"type": "number"},
              "sharpe_ratio": {"type": "number"},
              "volatility": {"type": "number"}
            }
          },
          "performance_metrics": {
            "type": "object",
            "properties": {
              "roi": {"type": "number"},
              "alpha": {"type": "number"},
              "beta": {"type": "number"}
            }
          },
          "compliance_metrics": {
            "type": "object",
            "properties": {
              "violation_rate": {"type": "number"},
              "audit_score": {"type": "number"}
            }
          }
        }
      }'
    ) RETURNING id INTO finance_id;

  -- Insert metrics
  INSERT INTO public.industry_metrics (category_id, name, description, unit, calculation_method)
  VALUES
    (healthcare_id, 'Patient Satisfaction', 'Average patient satisfaction score', 'score', 'average(satisfaction_scores)'),
    (retail_id, 'Sales Growth Rate', 'Year-over-year sales growth percentage', 'percentage', '((current_sales - previous_sales) / previous_sales) * 100'),
    (finance_id, 'Risk-Adjusted Return', 'Return adjusted for risk (Sharpe Ratio)', 'ratio', '(return - risk_free_rate) / standard_deviation');

  -- Insert benchmarks
  INSERT INTO public.industry_benchmarks (category_id, metric_id, value, percentile, year)
  SELECT 
    m.category_id,
    m.id as metric_id,
    CASE 
      WHEN c.name = 'Healthcare' THEN 85.0
      WHEN c.name = 'Retail' THEN 15.0
      WHEN c.name = 'Finance' THEN 1.5
    END as value,
    50 as percentile,
    2024 as year
  FROM public.industry_metrics m
  JOIN public.industry_categories c ON c.id = m.category_id;

  -- Only insert templates if we have an admin user
  IF admin_id IS NOT NULL THEN
    -- Insert templates
    INSERT INTO public.analysis_templates (
      category_id,
      name,
      description,
      configuration,
      created_by,
      is_public
    ) VALUES
    (
      healthcare_id,
      'Healthcare Performance Analysis',
      'Comprehensive healthcare metrics analysis template',
      '{
        "metrics": ["patient_satisfaction", "readmission_rate", "treatment_success"],
        "visualizations": ["trend", "comparison", "distribution"],
        "analysis_types": ["statistical", "predictive"]
      }'::jsonb,
      admin_id,
      true
    ),
    (
      retail_id,
      'Retail Sales & Inventory Analysis',
      'Complete retail performance analysis template',
      '{
        "metrics": ["sales_growth", "inventory_turnover", "customer_retention"],
        "visualizations": ["time_series", "heatmap", "funnel"],
        "analysis_types": ["trend", "seasonal", "predictive"]
      }'::jsonb,
      admin_id,
      true
    ),
    (
      finance_id,
      'Financial Risk Analysis',
      'In-depth financial risk assessment template',
      '{
        "metrics": ["var", "sharpe_ratio", "beta"],
        "visualizations": ["risk_matrix", "correlation", "monte_carlo"],
        "analysis_types": ["risk", "regression", "simulation"]
      }'::jsonb,
      admin_id,
      true
    );
  END IF;
END $$;