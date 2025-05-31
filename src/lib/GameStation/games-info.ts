class Emu {
	public name: string;
	public name_sub: string;
	public file: string;
	public drive: string = "";

	constructor(name: string, name_sub: string, file: string, drive?: string) {
		this.name = name;
		this.name_sub = name_sub;
		this.file = file + ".gge";
		if (drive) this.drive = drive;
	}
}

export const nintendoEmus: Emu[] = [
	new Emu("Atari 2600", "A_2600", "atari2600"),
	new Emu("Atari Jaguar", "A_Jag", "atari_jaguar"),
	new Emu("Nintendo 64", "N64", "n64_v2"),
	new Emu("Nintendo DS", "NDS", "nds"),
	new Emu("Nintendo Entertainment System", "NES", "nes"),
	new Emu("Super Nintendo", "SNES", "snes"),
	new Emu("Gameboy Advanced", "GBA", "gba"),
];

export const playstationEmus: Emu[] = [new Emu("Playstation", "PSX", "psx")];

export const emulators: Emu[] = nintendoEmus.concat(playstationEmus);
