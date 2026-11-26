// butterchurn ships UMD bundles with no types; MilkdropEngine.ts unwraps them by hand
declare module "butterchurn/lib/butterchurn.min.js" {
	const butterchurn: any;
	export default butterchurn;
}
declare module "butterchurn-presets/lib/*.min.js" {
	const pack: any;
	export default pack;
}
