import { z } from "zod/v4";
export const IdSchema = z.uuid();
export const TimestampSchema = z.iso.datetime();
export const DateSchema = z.coerce.date();
export const PhoneSchema = z.string();
export const EmailSchema = z.email();
