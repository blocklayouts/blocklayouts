import { __ } from "@wordpress/i18n";
import { Flex, Button, Icon, Navigator } from "@wordpress/components";

export const UpgradeScreen = ({ icon }) => {
	return (
		<>
			<Flex
				gap={3}
				direction="column"
				align="start"
				style={{ padding: "16px 12px" }}
			>
				<Icon size={38} icon={icon} style={{ marginLeft: "-6px" }} />
				<h3
					style={{
						fontSize: "1.2rem",
						margin: "10px 0 0 0",
						textAlign: "center",
					}}
				>
					{__("Get More Design Power!", "blocklayouts")}
				</h3>
				<p
					style={{
						margin: "0",
						color: "#757575",
					}}
				>
					{__(
						"Get access to premium patterns and templates that streamline your design process and save you hours of work.",
						"blocklayouts",
					)}
				</p>
				<Navigator.Button
					style={{
						marginTop: "12px",
						width: "100%",
						justifyContent: "center",
					}}
					variant="primary"
					path="/upgrade/activate"
					__next40pxDefaultSize
				>
					{__("I have a license key", "blocklayouts")}
				</Navigator.Button>
				<Button
					style={{
						width: "100%",
						justifyContent: "center",
					}}
					href="https://blocklayouts.com/premium/" // Premium page
					target="_blank"
					variant="secondary"
					__next40pxDefaultSize
				>
					{__("Upgrade now", "blocklayouts")}
				</Button>
			</Flex>
		</>
	);
};
