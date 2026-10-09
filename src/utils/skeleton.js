export const SidebarSkeleton = () => {
	return (
		<div className="animate-pulse" style={{ width: 220 }}>
			<div
				style={{
					height: 20,
					background: "#e0e0e0",
					borderRadius: 6,
					marginBottom: 20,
				}}
			/>
			{[...Array(8)].map((_, i) => (
				<div
					key={i}
					style={{
						height: 20,
						background: "#e0e0e0",
						borderRadius: 6,
						marginBottom: 20,
						width: `${80 + Math.random() * 20}%`,
					}}
				/>
			))}
		</div>
	);
};

export const AccountSkeleton = () => {
	return (
		<div
			className="animate-pulse"
			style={{ display: "flex", alignItems: "center", gap: 16 }}
		>
			<div
				style={{
					height: 10,
					width: 40,
					background: "#e0e0e0",
					borderRadius: 6,
				}}
			/>
			<div
				style={{
					height: 28,
					width: 28,
					background: "#e0e0e0",
					borderRadius: 6,
				}}
			/>
		</div>
	);
};

export const ExtensionSkeleton = () => {
	return (
		<div className="animate-pulse" style={{ display: "flex", gap: 16 }}>
			<div
				style={{
					height: 28,
					width: 28,
					background: "#e0e0e0",
					borderRadius: 6,
				}}
			/>
			<div
				style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
			>
				<div
					style={{
						height: 10,
						width: 40,
						background: "#e0e0e0",
						borderRadius: 6,
					}}
				/>
				<div
					style={{
						height: 10,
						width: "80%",
						background: "#e0e0e0",
						borderRadius: 6,
					}}
				/>
				<div
					style={{
						height: 10,
						width: "60%",
						background: "#e0e0e0",
						borderRadius: 6,
					}}
				/>
			</div>
		</div>
	);
};

export const BlocksSkeleton = () => {
	return (
		<div className="blocklayouts-dashboard__blocks">
			<div className="blocklayouts-dashboard__grid">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="blocklayouts-dashboard__card">
						<ExtensionSkeleton />
					</div>
				))}
			</div>
		</div>
	);
};

export const PatternSkeleton = () => {
	return (
		<>
			<div
				className="animate-pulse"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					margin: "32px 0",
				}}
			>
				<div
					style={{
						height: 16,
						width: 100,
						background: "#e0e0e0",
						borderRadius: 6,
					}}
				/>
				<div
					style={{
						height: 16,
						width: 60,
						background: "#e0e0e0",
						borderRadius: 6,
					}}
				/>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: 32,
				}}
			>
				{[...Array(6)].map((_, i) => (
					<div
						key={i}
						className="animate-pulse"
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 10,
						}}
					>
						<div
							style={{ height: 200, background: "#e0e0e0", borderRadius: 6 }}
						/>
						<div
							style={{
								height: 12,
								width: "80%",
								background: "#e0e0e0",
								borderRadius: 6,
							}}
						/>
						<div
							style={{
								height: 12,
								width: "60%",
								background: "#e0e0e0",
								borderRadius: 6,
							}}
						/>
					</div>
				))}
			</div>
		</>
	);
};
