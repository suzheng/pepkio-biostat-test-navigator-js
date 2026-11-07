// SPDX-License-Identifier: MIT
import { z } from "zod";

export const templateIdSchema = z.enum([
  "qpcr",
  "flow_cytometry",
  "western_blot",
  "survival",
  "rna_seq_small_n",
  "custom",
]);

export const outcomeTypeSchema = z.enum(["continuous", "categorical", "survival"]);

export const comparisonTypeSchema = z.enum([
  "two_groups",
  "multiple_groups",
  "paired_before_after",
]);

export const postHocIntentSchema = z.enum(["all_pairs", "vs_control"]);

export const dataFormatSchema = z.enum(["wide", "long"]);

export const groupDataSchema = z.object({
  name: z.string(),
  values: z.array(z.number()),
});

export const categoricalTableSchema = z.array(z.array(z.number()));

export const biostatTestNavigatorInputSchema = z
  .object({
    template_id: templateIdSchema.optional(),
    outcome_type: outcomeTypeSchema.optional(),
    comparison_type: comparisonTypeSchema.optional(),
    group_count: z.number().int().min(2).max(20).optional(),
    paired: z.boolean().optional(),
    post_hoc_intent: postHocIntentSchema.optional(),
    control_group: z.string().optional(),
    groups: z.array(groupDataSchema).optional(),
    categorical_table: categoricalTableSchema.optional(),
    data_format: dataFormatSchema.optional(),
    value_column: z.string().optional(),
    group_column: z.string().optional(),
  })
  .passthrough();

export type TemplateIdInput = z.infer<typeof templateIdSchema>;
export type OutcomeTypeInput = z.infer<typeof outcomeTypeSchema>;
export type ComparisonTypeInput = z.infer<typeof comparisonTypeSchema>;
export type PostHocIntentInput = z.infer<typeof postHocIntentSchema>;
export type DataFormatInput = z.infer<typeof dataFormatSchema>;
export type GroupDataInput = z.infer<typeof groupDataSchema>;
export type CategoricalTableInput = z.infer<typeof categoricalTableSchema>;

export type BiostatTestNavigatorInput = z.input<typeof biostatTestNavigatorInputSchema>;
export type BiostatTestNavigatorResolvedInput = z.infer<typeof biostatTestNavigatorInputSchema>;

export function parseRunInput(input: unknown): BiostatTestNavigatorResolvedInput {
  return biostatTestNavigatorInputSchema.parse(input);
}
