import { z } from "zod/v4";

export const IdSchema = z.uuid();
export type Id = z.infer<typeof IdSchema>;
export const TimestampSchema = z.iso.datetime();
export type Timestamp = z.infer<typeof TimestampSchema>;
export const DateSchema = z.iso.date();
export type Date = z.infer<typeof DateSchema>;
