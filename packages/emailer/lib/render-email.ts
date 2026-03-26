import { render } from "@react-email/render";
import InvitationEmail, {
	type InvitationEmailProps,
	InvitationEmailSchema,
} from "../templates/invitation-email";

export async function renderInvitationEmail(
	data: InvitationEmailProps,
): Promise<string> {
	const validated = InvitationEmailSchema.parse(data);
	return await render(InvitationEmail(validated));
}

export type InvitationEmailData = InvitationEmailProps;
