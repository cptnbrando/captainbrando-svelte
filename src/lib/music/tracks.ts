export class Track {
	src: string;
	artist: string;
	name: string;
	album: string;
	img: string;
  	arrAlbum: Album;

	constructor(src: string, name: string, album: string) {
    this.arrAlbum = albums.find(el => el.name === album);
    if(!this.arrAlbum) {
      this.arrAlbum = new Album(album, 'sailboat', 'Captain Brando!');
      albums.push(this.arrAlbum);
    }
		this.src = (src.length > 65) ? src : 'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/' + src + '.mp3';
		this.artist = this.arrAlbum.artist;
		this.name = name;
		this.album = this.arrAlbum.name;
		this.img = this.arrAlbum.src;
	}
}

export class Album {
	name: string;
	src: string;
	artist: string;
  	tracks: Track[];

	constructor(name: string, src: string, artist?: string, tracks?: string[]) {
		this.name = name;
		this.src = 'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/images/' + src + '.png';
		this.artist = artist ? artist : name;
	}
}

export let albums: Album[] = [
	new Album(
		'2023',
		'chase',
		'The Cut Ties'
	),
	new Album(
		'2022',
		'paint',
		'Captain Brando!'
	),
	new Album(
		'ily',
    	'ily',
		'Captain Brando!'
	),
	new Album(
		'RIP',
    	'rip',
		'Captain Brando!'
	),
	new Album(
		'Altona Meadows',
		'bbetc',
		'Altona Meadows'
	),
	new Album(
		'Cigs Inside Live',
		'cigs',
		'Cigs Inside'
	),
	new Album(
		'Criss Cross Apple Sauwce',
		'dead',
		'brando & theo'
	),
	new Album(
		'3RR0R 404',
		'sailboat',
		'???'
	)
];

export const tracks: Track[] = [
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/2bedroomtoyota.mp3',
		'2 Bedroom Toyota',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/BEGIN.mp3',
		'BEGIN!',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/Lamborghini.mp3',
		'Lamborghini',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/drive.mp3',
		'Right Side',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/eyes.mp3',
		'eyesss.mp3',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/problems.mp3',
		'PROBLEMS',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/shoulda_cutTies.mp3',
		'shoulda (cut ties)',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/spanish.mp3',
		'spanish!',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2023/velvet.mp3',
		'Velvet',
		'2023',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/IDKOK.mp3',
		'IDKOK',
		'ily'
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/Instagram.mp3',
		'Instagram',
		'ily',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/him.mp3',
		'him',
		'ily',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/october13.mp3',
		'October 13th',
		'ily',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/him(demo).mp3',
		'him (demo)',
		'ily',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/down3-2.mp3',
		'down3-2',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/paralyzed.mp3',
		'Paralyzed Paraplegic',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/GiveIn.mp3',
		'GiveIn_444',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/mental.mp3',
		'mental health disorders',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/stab.mp3',
		'stab.wav',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/WAITAMINUTE.mp3',
		'WAITAMINUTE',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/better44.mp3',
		'better44.mp3',
		'RIP',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bargainbin.mp3',
		'Bargain Bin',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bbetc.mp3',
		'Better Better, etc.',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/bullshit.mp3',
		'bullshit.mp3',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/jam2.mp3',
		'jam2.mp3',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/feel.mp3',
		'Feel It Still (remix)',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/passion.mp3',
		'Passionfruit (remix)',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/assignment8.mp3',
		'assignment8.mp3',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/panama.mp3',
		'The Panama Papers',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/old/kenny.mp3',
		'kenny.mp3',
		'Altona Meadows',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/bulkhead.mp3',
		'BULKHEAD',
		'2022',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/alone.mp3',
		'Alone (Mac DeMarco Cover)',
		'Cigs Inside Live',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/how.mp3',
		'How?',
		'Cigs Inside Live',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/work.mp3',
		'Work This Time (King Gizzard Cover)',
		'Cigs Inside Live',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/liquor.mp3',
		'Liquor Laced & Lucid',
		'Cigs Inside Live',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/cigs/sleepwalk.mp3',
		'Sleepwalk With Me',
		'Cigs Inside Live',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/drrrrrumerrrrrrr.mp3',
		'drrrrrumerrrrrrr.mp3',
		'2022',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/somewhere.mp3',
		'somewhere.mp3',
		'2022',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/comeback.mp3',
		'(dont call it a) comeback!',
		'2022',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/whereyougoin.mp3',
		'where you goin? (demo)',
		'2022',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/kernalPanic.mp3',
		'kernal PANIC !!!',
		'3RR0R 404',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/paralyzedIn.mp3',
		'Paralyzed (instrumental)',
		'3RR0R 404',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/PARALLEL.mp3',
		'PARALLEL',
		'3RR0R 404',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/AVATAR1.mp3',
		'AVATAR1.mp3',
		'3RR0R 404',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/playground.mp3',
		'playground.mp3',
		'3RR0R 404',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/error/kenny2.mp3',
		'kenny2.mp3',
		'3RR0R 404',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/intro.mp3',
		'intro',
		'Criss Cross Apple Sauwce',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/uponme.mp3',
		'up on me',
		'Criss Cross Apple Sauwce',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/what.mp3',
		'..what?',
		'Criss Cross Apple Sauwce',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/crossed/recess.mp3',
		'recess',
		'Criss Cross Apple Sauwce',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/ILLFINDHER.mp3',
		"I'LL FIND HER",
		'2022',
	),
	new Track(
		'https://raw.githubusercontent.com/dcruzships/dcruz-assets/master/music/2022/life.mp3',
		'life.mp3',
		'2022',
	)
];
