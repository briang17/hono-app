import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import { z } from "zod";

export const InvitationEmailSchema = z.object({
	invitationId: z.string(),
	email: z.string().email(),
	organizationName: z.string(),
	inviterName: z.string().optional(),
});

export type InvitationEmailProps = z.infer<typeof InvitationEmailSchema>;

export default function InvitationEmail(props: InvitationEmailProps) {
	const { invitationId, email, organizationName, inviterName } = props;

	const acceptUrl = `https://app.rs.hauntednuke.com/invite/accept?invitationId=${invitationId}&email=${encodeURIComponent(email)}`;

	return (
		<Html>
			<Head />
			<Preview>Join {organizationName} on RealSource</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>You're invited to join {organizationName}</Heading>

					{inviterName ? (
						<Text style={paragraph}>{inviterName} has invited you to join their organization.</Text>
					) : (
						<Text style={paragraph}>You've been invited to join this organization.</Text>
					)}

					<Section style={buttonContainer}>
						<Button style={button} href={acceptUrl}>
							Accept Invitation
						</Button>
					</Section>

					<Text style={paragraph}>
						Or copy and paste this link into your browser:
					</Text>
					<Link href={acceptUrl} style={link}>
						{acceptUrl}
					</Link>

					<Text style={footer}>
						If you didn't request this invitation, you can safely ignore this email.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#ffffff",
	fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
};

const heading = {
	fontSize: "24px",
	fontWeight: "600",
	color: "#1a1a1a",
	marginBottom: "16px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "1.6",
	color: "#374151",
	marginBottom: "16px",
};

const buttonContainer = {
	margin: "32px 0",
};

const button = {
	backgroundColor: "#000000",
	color: "#ffffff",
	padding: "12px 24px",
	fontSize: "16px",
	fontWeight: "600",
	borderRadius: "6px",
	textDecoration: "none",
	display: "inline-block",
};

const link = {
	color: "#000000",
	textDecoration: "underline",
	fontSize: "14px",
	wordBreak: "break-all",
};

const footer = {
	fontSize: "14px",
	color: "#6b7280",
	marginTop: "32px",
};
