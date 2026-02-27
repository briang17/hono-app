import { z } from "zod/v4";

export const IdSchema = z.uuid();
export type Id = z.infer<typeof IdSchema>;

export const TimestampSchema = z.iso.datetime();
export type Timestamp = z.infer<typeof TimestampSchema>;

export const DateSchema = z.coerce.date();
export type Date = z.infer<typeof DateSchema>;


export const PhoneSchema = z.string();
export type Phone = z.infer<typeof PhoneSchema>;

export const EmailSchema = z.email();
export type Email = z.infer<typeof EmailSchema>;