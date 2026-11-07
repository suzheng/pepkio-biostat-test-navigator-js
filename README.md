# Pepkio Biostat Test Navigator

Typed Node.js and TypeScript client library with a command-line interface for automated statistical test selection, distribution assumption diagnostics, and hypothesis evaluation via the Pepkio Tools REST API.

# What It Does

Selecting the appropriate statistical test for biological and biomedical assays—such as quantitative real-time PCR (qPCR), Western blot densitometry, cell viability screens, animal cohort survival studies, and flow cytometry—is critical to prevent inflated false positives (Type I errors) or lost statistical power (Type II errors). In wet-lab experiments, datasets frequently feature small sample sizes (n < 5), non-normal distributions, or unequal group variances that violate standard parametric assumptions. Defaulting to Student's t-tests or ANOVA without diagnostics risks invalid conclusions.

This package provides a typed Node.js client and command-line interface (CLI) for the hosted Pepkio Biostat Test Navigator REST API. It evaluates experimental design metadata (sample size, continuous vs. categorical outcomes, group counts, pairing, and factor levels) and performs automated distribution diagnostics (Shapiro-Wilk normality and Levene's homoscedasticity) to select, calculate, and report the most statistically sound parametric or non-parametric test.

Programmatic runs require a network connection and a Pepkio API key. Statistical computations, distribution diagnostics, post-hoc adjustments, and reproducibility code generation are executed remotely by the Pepkio API engine.

# Features

- **Automated Test Selection**: Evaluates experimental design and data distributions to recommend and execute optimal parametric or non-parametric tests.
- **Assumption Diagnostics**: Automatically performs Shapiro-Wilk normality tests and Levene's homoscedasticity tests before test execution.
- **Comprehensive Test Library**: Supports Student's t-test, Welch's t-test, Paired t-test, Mann-Whitney U test, Wilcoxon signed-rank test, One-Way ANOVA, Welch ANOVA, Kruskal-Wallis, Two-Way ANOVA, Repeated Measures ANOVA, Friedman test, Chi-Square, and Fisher's Exact test.
- **Post-Hoc Pairwise Comparisons**: Automatically performs Tukey's HSD, Games-Howell, or Dunn's tests with Bonferroni or Benjamini-Hochberg FDR adjustments.
- **Effect Sizes & Confidence Intervals**: Computes standardized effect sizes—including Cohen's d, Hedges' g, eta-squared, partial eta-squared, and Rank-Biserial correlation—with 95% confidence intervals.
- **Typed ESM Client**: Full TypeScript definitions with Zod schema validation and promise-based client methods (`getManifest`, `listExamples`, `getExampleInput`, `run`, `compareGroups`, `analyzeContingencyTable`).
- **CLI Utilities**: Inspect manifests, list examples, and execute biostatistical test runs directly from the terminal.
- **Reproducibility Snippets & Permalinks**: Generates Python analysis code, methods writeups, and permanent shareable URLs for publication records.

# Installation

```bash
npm install pepkio-biostat-test-navigator
```

Requires Node.js 18 or newer.

# Configuration

Set an API key with **tools:run** scope before invoking `run()` or convenience helpers:

```bash
export PEPKIO_API_KEY="your-api-key"
```

Create and manage keys in your [Pepkio Account](https://www.pepkio.com/account/api-keys).

Optional configuration variables:

| Variable | Purpose |
|----------|---------|
| `PEPKIO_API_KEY` | Production API key (required for `run`) |
| `LOCAL_PEPKIO_API_KEY` | Local development key when `PEPKIO_API_BASE_URL` points to `tools.localtest.me` |
| `PEPKIO_API_BASE_URL` | API base URL (default: `https://tools.pepkio.com`) |

# Quick Example

```typescript
import { PepkioClient } from "pepkio-biostat-test-navigator";

const client = new PepkioClient({ apiKey: process.env.PEPKIO_API_KEY });

// Compare experimental groups with automated normality and variance checks
const result = await client.compareGroups(
  [
    { name: "Vehicle Control", values: [12.1, 11.8, 12.5, 11.9, 12.2] },
    { name: "Low Dose", values: [15.4, 14.8, 15.1, 16.0, 14.9] },
    { name: "High Dose", values: [22.3, 21.9, 23.1, 22.0, 22.8] },
  ],
  {
    templateId: "custom",
    postHocIntent: "vs_control",
    controlGroup: "Vehicle Control",
  },
);

console.log("Status:", result.status);
console.log("Recommended Primary Test:", result.result?.primary_test);
console.log("Post-hoc Test:", result.result?.post_hoc_test);
console.log("Rationale:", result.result?.rationale);
console.log("Methods Writeup:\n", result.result?.methods_paragraph);
console.log("Permalink:", result.permalink);
```

# CLI

```bash
# List available manifest examples
npx pepkio-biostat-test-navigator manifest --examples

# Run a manifest example
npx pepkio-biostat-test-navigator run --example qpcr_two_group_mann_whitney
```

# Typical Use Cases

- **qPCR Relative Gene Expression**: Determine whether to use an unpaired Student's t-test, Welch's t-test, or Mann-Whitney U test for fold changes across small sample cohorts (n = 3 to 6).
- **Western Blot Densitometry**: Evaluate optical density across multiple treatment conditions to choose between One-Way ANOVA with Tukey post-hoc or Kruskal-Wallis with Dunn's test.
- **Cell Viability & Proliferation Assays**: Assess multi-dose cytotoxicity screens with automated normality diagnostics and homoscedasticity checking.
- **Preclinical Animal Studies**: Compare physiological biomarkers over time in paired animal cohorts using Repeated Measures ANOVA or the non-parametric Friedman test.
- **Histopathology & Flow Cytometry Gating**: Analyze responder vs. non-responder cell populations using Chi-Square tests or Fisher's Exact test for small sample contingency tables.

# Scientific Background

Hypothesis testing in biological research requires choosing between parametric models (which assume normally distributed populations with equal variance) and non-parametric rank-based alternatives. Violating parametric assumptions inflates Type I error rates when distributions are skewed or sample sizes are small (n < 30).

The Shapiro-Wilk test evaluates normality (null hypothesis: data are normally distributed), while Levene's test assesses homoscedasticity (null hypothesis: group variances are equal). When assumptions fail, rank-based tests—such as the Mann-Whitney U test (for two independent groups) or the Kruskal-Wallis test (for 3 or more groups)—preserve test validity without assuming normal distributions. For multi-group designs, post-hoc procedures (Tukey HSD, Games-Howell, or Dunn's test with Benjamini-Hochberg FDR correction) adjust p-values to control family-wise error rates across multiple pairwise comparisons.

# Web Application

For researchers who prefer a graphical interface, an interactive web version is available.

Web Application: https://www.pepkio.com/tools/biostat-test-navigator

The web interface provides interactive data entry, decision tree visualizations, distribution assumption plots, and downloadable publication-ready summary reports.

# Documentation and Resources

GitHub Repository: https://github.com/pepkio/pepkio-biostat-test-navigator-js

Web Application: https://www.pepkio.com/tools/biostat-test-navigator

Python client (PyPI): https://pypi.org/project/pepkio-biostat-test-navigator/

# About Pepkio

Pepkio (https://www.pepkio.com/) develops software tools and bioinformatics solutions for life science researchers, including laboratory calculators and analysis services (https://www.pepkio.com/cro).

A semantic, AI-native version of this document in the K2F format is available at https://k2f.dev (https://k2f.dev/v/070ab7627ac76972ca1bc968af0aca8840d9341126d229ef8e71c49b64cbbaba)
