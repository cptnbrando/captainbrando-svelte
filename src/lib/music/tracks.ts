export const defaultTracks: number[] = [0, 5, 6, 7, 8, 13, 15, 19, 20, 21, 22, 25, 27, 28, 29, 30, 31, 35];

// To add tracks, first create a new Album in the array at line 40
// Then, copy and paste a track in the array on line 94
// Upload the file to here https://github.com/Dcruzships/dcruz-assets/tree/master/music
// NOTE: folders can't be added directly on the github site
// ...so go to github desktop, then sign into the old account, then upload the files to the dcruz-assets repo
// AND remember that the audio filenames are best to a single word, short long ikbefhqrwla i dont care anymore. legacy code shit.
// like afghjnor.mp3

// After you get them in a new folder on that link
// Copy the url and format it into like this https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/BEGIN.mp3
// It starts with https://raw.githubusercontent.com/ because github aint a cdn lol
// Then add the gh user
// Then the repo
// Then the branch
// Then the music
// Then the album
// Then the abfhijur.mp3

// Then, thats it, push that shit, its live on the site

export class Track {
	src: string;
	artist: string;
	name: string;
	album: string;
	img: string;
	arrAlbum: Album;
	download: boolean;
	when: string;
	where: string;
	why: string;

	constructor(src: string, name: string, album: string, when?: string, where?: string, why?: string) {
		this.arrAlbum = albums.find((el) => el.name === album);
		if (!this.arrAlbum) {
			this.arrAlbum = new Album(album, "sailboat", "Captain Brando!");
			albums.push(this.arrAlbum);
		}
		this.src =
			src.length > 65 ? src : "https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/" + src + ".mp3";
		this.artist = this.arrAlbum.artist;
		this.name = name;
		this.album = this.arrAlbum.name;
		this.img = this.arrAlbum.src;

		this.when = when;
		this.where = where;
		this.why = why;
	}
}

export class Album {
	name: string;
	src: string;
	artist: string;
	tracks: Track[];

	constructor(name: string, src: string, artist?: string) {
		this.name = name;
		this.src = "https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/images/webp/" + src + ".webp";
		this.artist = artist ? artist : name;
	}
}

// Curated from the captainBrandoMixtape flags in music-catalog.dog (dcruz-assets root)
export const MIXTAPE_ALBUM = "Captain Brando! Mixtape";

export let albums: Album[] = [
	// Duplicate this to add new album
	// new Album(
	// 	'for yall',
	// 	'friends',
	// 	'😁'
	// ),
	new Album(MIXTAPE_ALBUM, "sailboat", "Captain Brando!"),
	new Album("NO DOGS ALLOWED", "meat", "DOGS"),
	new Album("Shepherd", "man", "DOGS"),
	new Album("🗣️", "bark", "DOGS"),
	new Album("hundred fifty", "hundred", "DOGS"),
	new Album("Cigs Inside Live", "cigs", "Cigs Inside"),
	new Album("RIP", "rip", "Captain Brando!"),
	new Album("2023", "yuh", "Captain Brando!"),
	new Album("2022", "chase", "Captain Brando!"),
	new Album("2021", "paint", "Captain Brando!"),
	new Album("ily", "ily", "Captain Brando!"),
	new Album("Altona Meadows", "bbetc", "Altona Meadows"),
	new Album("covers, etc. (saul)", "saul", "brandon & theo"),
	new Album("Criss Cross Apple Sauwce", "dead", "brando & theo"),
	new Album("3RR0R 404", "sailboat", "???"),
];

export const tracks: Track[] = [
	// Like copy this one, then its good
	// new Track(
	// 	'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/2bedroomtoyota.mp3',
	// 	'2 Bedroom Toyota',
	// 	'2023',
	// ),
	//
	// -5:00 = CT Central Time
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2026/echo.mp3",
		"echo",
		"NO DOGS ALLOWED",
		"2026-08-25T13:20:00-05:00",
		"tulsa, with ex wife. dog getting flu shots.",
		"couldn't make it work. unemployable now. trying to fail forward but so far i'm just racking up debt."
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2026/doughnuts.mp3",
		"doughnuts",
		"NO DOGS ALLOWED",
		"2026-05-30T13:30:00-05:00",
		"tulsa, with wife and dog",
		"doughnuts are the best food in the world. i want to eat them all day every day. i want to be a doughnut. i want to be inside a doughnut, and eat the doughnut that i'm inside of, and then be inside the doughnut that i'm eating, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one, and then be inside that one, and then eat that one.. . . I pushed tab and a ai wrote that. so thats nice glad to see that ai is working correctly. damn. what the fuck is up world? the matrix world. the code pushers. the brick layers. the chief chefs. the pterodactyls. the gummy bears. yummy"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2026/GRIEF2.mp3",
		"(13 Years of Grief by Black Label Society)",
		"NO DOGS ALLOWED",
		"2026-04-08T19:30:00-05:00",
		"dallas, mom's place",
		"fuck COPES"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/dastardly.mp3",
		"dastardly",
		"Shepherd",
		"2025-10-07T20:17:00-05:00",
		"tulsa, home",
		"8=====D"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/lips3.mp3",
		"Lips (tunnel vision by jt)",
		"Shepherd",
		"2025-10-07T20:17:00-05:00",
		"tulsa, home",
		"Back on meds. Yay."
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/GAMEOVER.mp3",
		"GAMEOVER",
		"Shepherd",
		"2025-09-14T23:15:00-05:00",
		"tulsa, home",
		"Got fired from a job I really like. I screamed at the front door, then somehow, a few hours later Charlie Kirk got assassinated. Man. I really liked that job. The hours were awesome. The people were kind. I burned the bridge on the way out I am very tired of pretending to be someone I am not. I am captain brando. For fuck's sake I can do anything. I frequently forget that. I forget a lot of things. For some reason my life feels like a string of many different lives, instead of a growth a cycle a single life that is progressing. I feel like I ain't progressing at shit. If anything I am getting worse, somedays I get better, other days worse, just a wave. Just a wave going on and on. Splashing in the ocean. Splash splash."
	),
	//new Track(
	//"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/batman-saturday-august162025-224pm-good2.mp3",
	//	"bat man",
	//	"Shepherd",
	//		"2025-08-16T14:24:00-05:00",
	//	"tulsa, home",
	//		"Just driving around, nothing to see here yall"
	//	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/thatsasgoodasitgets-thursday-july312025-152pm.mp3",
		"that's as good as it gets",
		"Shepherd",
		"2025-07-31T13:52:00-05:00",
		"tulsa, home",
		"Just driving around, nothing to see here yall"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/clunky.mp3", "clunky", "🗣️", "2025-01-14T20:07:12-08:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/obsessedNH.mp3",
		"obsessed",
		"🗣️",
		"2025-04-14T13:52:00-05:00",
		"New York Bagel Cafe on Yale + a week later in my apartment in my home city",
		"sun-dried tomato bagel, toasted, with garlic herb cream cheese. best eaten in store, otherwise, much less crispy experience"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/sexy.mp3", "sexy", "🗣️", "2025-01-31T15:16:16-08:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/bellathorne3.mp3",
		"bella thorne",
		"🗣️",
		"2025-05-28T11:07:00-05:00 to 2025-05-31T00:49:00-05:00",
		"Tulsa, apt, mailman lost my sufjan stevens vinyl again. the 10th anniversary of carrie and lowell. damnit. i'm so confused how he could have given me the wrong key for the package box, when the key for the package box sits on the lock for the package box. all he had to do was take it and put it in my mailbox. instead he puts a different key in there one that doesn't fit any of the package lockers. i just want my record damnit, does the fucking mail deliver on saturdays? i think it's trapped in the box that's locked that i don't got the key for. i'm gonna remember this feeling of not being able to get something when it's right next to me.",
		"bella thorne is SO hot!"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/dreams.mp3",
		"dreams, airports",
		"🗣️",
		"2025-04-29T14:21:00-05:00 to 2025-05-02T12:46:00-04:00",
		"Punta Cana - Liva Aqua resort - Terminal B Gate 32, American Airlines flight AA2744 confirmation code NOXCFY, delayed 37 minutes for maintenance. then delayed an hour. then delayed another 2 hours. captain said it was to change a tire, as the tread appeared too worn out.",
		"I just got married. My wedding and honeymoon were so impossibly perfect, that it's enough for me to think about God again. And airports. I'm sitting here in a lime green chair, Punta Cana airport, waiting for my flight. I love this place. The people, the food, the lifestyle, the horses, the banana trees. Beef on plantains. Beef on plantains! It is all so miraculously beautiful. I'm trying to become somebody else. I've become somebody I don't like, by mistake. It wasn't supposed to go this way. But here I am, a wolf, an exhausted warrior, cutting everything and anything around me with the force of a buster blade. Destruction. Chaos. John Cena with a fucking chainsaw. I have to do better. I have to be better. For her, and for my future children."
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/whackamole3.mp3",
		"whack a mole",
		"hundred fifty",
		"2024-12-08T21:11:26-08:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/LOUDASSINDIAN_final.mp3",
		"LOUDASSINDIAN",
		"hundred fifty",
		"2024-12-08T21:11:26-08:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/ninja.mp3",
		"ninja",
		"hundred fifty",
		"2025-01-14T20:07:12-08:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/break.mp3",
		"BREAK IT!",
		"hundred fifty",
		"2025-03-16T12:45:24-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/DOGS1_cut.mp3",
		"DOGS WON",
		"hundred fifty",
		"2025-01-27T00:21:40-06:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/problems.mp3",
		"FCKN PRBLMS by The Cut Ties",
		"hundred fifty",
		"2023-05-31T14:51:27-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/badsong2.mp3",
		"bad_song_2",
		"hundred fifty",
		"2023-07-17T23:27:10-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/udnm.mp3",
		"you dont need much",
		"hundred fifty",
		"2024-05-05T23:13:47-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/2bedroomtoyota.mp3",
		"2 Bedroom Toyota",
		"2022",
		"2023-05-31T14:51:27-05:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/BEGIN.mp3", "BEGIN!", "2022", "2023-05-31T14:51:27-05:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/Lamborghini.mp3",
		"Lamborghini",
		"2022",
		"2023-05-31T14:51:27-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/eyes.mp3",
		"eyesss.mp3",
		"2022",
		"2023-05-31T14:51:27-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/spanish.mp3",
		"spanish!",
		"2022",
		"2023-05-31T14:51:27-05:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/velvet.mp3", "Velvet", "2022", "2023-05-31T14:51:27-05:00"),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/IDKOK.mp3", "IDKOK", "ily", "2021-01-15T13:36:31-06:00"),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/Instagram.mp3", "Instagram", "ily", "2021-01-15T13:36:31-06:00"),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/him.mp3", "him", "ily", "2020-06-06T17:16:16-05:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/october13.mp3",
		"October 13th",
		"ily",
		"2021-01-15T13:36:31-06:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/him(demo).mp3",
		"him (demo)",
		"ily",
		"2021-01-15T13:36:31-06:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/down3-2.mp3", "down3-2", "RIP", "2021-01-15T13:36:31-06:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/paralyzed.mp3",
		"Paralyzed Paraplegic",
		"RIP",
		"2020-06-06T17:16:16-05:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/GiveIn.mp3", "GiveIn_444", "RIP", "2021-01-15T13:36:31-06:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/mental.mp3",
		"mental health disorders",
		"RIP",
		"2021-01-15T13:36:31-06:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/stab.mp3", "stab.wav", "RIP", "2021-01-15T13:36:31-06:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/WAITAMINUTE.mp3",
		"WAITAMINUTE",
		"RIP",
		"2021-01-15T13:36:31-06:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/better44.mp3",
		"better44.mp3",
		"RIP",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bargainbin.mp3",
		"Bargain Bin",
		"Altona Meadows",
		"2020-06-06T17:16:16-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bbetc.mp3",
		"Better Better, etc.",
		"Altona Meadows",
		"2020-06-06T17:16:16-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/bullshit.mp3",
		"bullshit.mp3",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/jam2.mp3",
		"jam2.mp3",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/feel.mp3",
		"Feel It Still (remix)",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/passion.mp3",
		"Passionfruit (remix)",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/assignment8.mp3",
		"assignment8.mp3",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/panama.mp3",
		"The Panama Papers",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/kenny.mp3",
		"kenny.mp3",
		"Altona Meadows",
		"2022-05-13T15:28:01-05:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bulkhead.mp3", "BULKHEAD", "2021", "2021-01-18T14:21:46-06:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/alone.mp3",
		"Alone (Mac DeMarco Cover)",
		"Cigs Inside Live",
		"2021-08-31T14:51:41-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/how.mp3",
		"How?",
		"Cigs Inside Live",
		"2021-08-31T14:51:41-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/work.mp3",
		"Work This Time (King Gizzard Cover)",
		"Cigs Inside Live",
		"2021-08-31T14:51:41-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/liquor.mp3",
		"Liquor Laced & Lucid",
		"Cigs Inside Live",
		"2022-05-13T12:23:30-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/sleepwalk.mp3",
		"Sleepwalk With Me",
		"Cigs Inside Live",
		"2022-05-13T12:23:30-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/drrrrrumerrrrrrr.mp3",
		"drrrrrumerrrrrrr.mp3",
		"2021",
		"2022-05-13T12:23:30-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/somewhere.mp3",
		"somewhere.mp3",
		"2021",
		"2022-05-13T12:23:30-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/comeback.mp3",
		"(dont call it a) comeback!",
		"2021",
		"2022-05-13T12:23:30-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/whereyougoin.mp3",
		"where you goin? (demo)",
		"2023",
		"2022-05-13T12:23:30-05:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/life.mp3", "life.mp3", "2023", "2022-07-13T12:38:23-05:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/4/shoulda%2C%20my%20addition%20to%20brandos%20ideamp3.mp3",
		"shoulda",
		"2023",
		"2023-07-14T03:45:52-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/drive.mp3",
		"brightside",
		"2023",
		"2023-05-31T14:51:27-05:00"
	),
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/newAYUP.mp3", "ayup.mp3", "2023", "2023-07-13T23:50:25-05:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/kernalPanic.mp3",
		"kernal PANIC !!!",
		"3RR0R 404",
		"2022-05-24T16:23:00-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/paralyzedIn.mp3",
		"Paralyzed (instrumental)",
		"3RR0R 404",
		"2022-05-24T16:23:00-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/PARALLEL.mp3",
		"PARALLEL",
		"3RR0R 404",
		"2022-05-24T16:23:00-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/AVATAR1.mp3",
		"AVATAR1.mp3",
		"3RR0R 404",
		"2022-05-24T14:33:52-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/playground.mp3",
		"playground.mp3",
		"3RR0R 404",
		"2022-07-13T12:43:57-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/kenny2.mp3",
		"kenny2.mp3",
		"3RR0R 404",
		"2022-07-13T12:43:57-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/jump.mp3",
		"jump",
		"3RR0R 404",
		"2025-02-23T15:19:51-06:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/keys.mp3",
		"gimme the keys",
		"3RR0R 404",
		"2025-03-16T12:45:24-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/beowulf.mp3",
		"beowulf",
		"3RR0R 404",
		"2025-01-31T15:16:16-08:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/vitamind.mp3",
		"vitamin d",
		"3RR0R 404",
		"2024-10-21T08:55:21-07:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/isthereanybodyoutthere.mp3",
		"need2/creep (Pinegrove/Radiohead)",
		"covers, etc. (saul)",
		"2023-07-17T11:14:06-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/rust/245AM.mp3",
		"2:45 AM (Elliott Smith) (w/ theo)",
		"covers, etc. (saul)",
		"2023-07-24T10:19:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/rust/bottleUPandEXPLODE.mp3",
		"Bottle Up and Explode! (Elliott Smith) (w/ theo)",
		"covers, etc. (saul)",
		"2023-07-24T10:19:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/rust/CHRISTIANBROTHERS.mp3",
		"Christian Brothers (Elliott Smith) (w/ theo)",
		"covers, etc. (saul)",
		"2023-07-24T10:19:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/intro.mp3",
		"intro",
		"Criss Cross Apple Sauwce",
		"2022-05-13T14:17:09-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/uponme.mp3",
		"up on me",
		"Criss Cross Apple Sauwce",
		"2022-05-13T14:17:09-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/what.mp3",
		"..what?",
		"Criss Cross Apple Sauwce",
		"2022-05-13T14:17:09-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/recess.mp3",
		"recess",
		"Criss Cross Apple Sauwce",
		"2022-05-13T14:17:09-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/ILLFINDHER.mp3",
		"I'LL FIND HER",
		"2021",
		"2022-07-13T12:43:57-05:00"
	),

	// --- Captain Brando! Mixtape ---
	// Reissues of tracks flagged captainBrandoMixtape in music-catalog.dog,
	// sequenced 2020 -> 2025: opens with BEGIN!, closes with that's as good as it gets.
	// (kenny2 + need2/creep are flagged "maybe" in the .dog and were left off)
	new Track("https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/BEGIN.mp3", "BEGIN!", MIXTAPE_ALBUM, "2023-05-31T14:51:27-05:00"),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bbetc.mp3",
		"Better Better, etc.",
		MIXTAPE_ALBUM,
		"2020-06-06T17:16:16-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/october13.mp3",
		"springtime",
		MIXTAPE_ALBUM,
		"2021-01-15T13:36:31-06:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/down3-2.mp3",
		"down3-2",
		MIXTAPE_ALBUM,
		"2021-01-15T13:36:31-06:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/better44.mp3",
		"better44.mp3",
		MIXTAPE_ALBUM,
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/passion.mp3",
		"Passionfruit (remix)",
		MIXTAPE_ALBUM,
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/panama.mp3",
		"The Panama Papers",
		MIXTAPE_ALBUM,
		"2022-05-13T15:28:01-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/kernalPanic.mp3",
		"kernal PANIC !!!",
		MIXTAPE_ALBUM,
		"2022-05-24T16:23:00-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/paralyzedIn.mp3",
		"Paralyzed (instrumental)",
		MIXTAPE_ALBUM,
		"2022-05-24T16:23:00-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/playground.mp3",
		"playground.mp3",
		MIXTAPE_ALBUM,
		"2022-07-13T12:43:57-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/2bedroomtoyota.mp3",
		"2 Bedroom Toyota",
		MIXTAPE_ALBUM,
		"2023-05-31T14:51:27-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/velvet.mp3",
		"Velvet",
		MIXTAPE_ALBUM,
		"2023-05-31T14:51:27-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/newAYUP.mp3",
		"ayup.mp3",
		MIXTAPE_ALBUM,
		"2023-07-13T23:50:25-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/4/shoulda%2C%20my%20addition%20to%20brandos%20ideamp3.mp3",
		"shoulda",
		MIXTAPE_ALBUM,
		"2023-07-14T03:45:52-05:00"
	),
	new Track(
		"https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2025/thatsasgoodasitgets-thursday-july312025-152pm.mp3",
		"that's as good as it gets",
		MIXTAPE_ALBUM,
		"2025-07-31T13:52:00-05:00",
		"tulsa, home",
		"Just driving around, nothing to see here yall"
	),
];
