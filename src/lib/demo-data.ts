export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export type Language = {
  slug: string;
  name: string;
  nativeName: string;
};

export type Song = {
  slug: string;
  title: string;
  category: string;
  language: string;
  artist?: string;
  excerpt: string;
  lyrics: string;
  addedDate: string;
  isPopular: boolean;
};

export const categories: Category[] = [
  { slug: "praise", name: "Praise", description: "Songs of praise and adoration.", icon: "🙌" },
  { slug: "worship", name: "Worship", description: "Worship and honor songs.", icon: "🎵" },
  { slug: "communion", name: "Communion", description: "Communion/Lord's Supper songs.", icon: "🍞" },
  { slug: "christmas", name: "Christmas", description: "Celebrating the birth of Christ.", icon: "⭐" },
  { slug: "new_year", name: "New Year", description: "New Year praise and dedication.", icon: "🗓️" },
  { slug: "easter", name: "Easter", description: "Resurrection Sunday worship.", icon: "🌅" },
  { slug: "good_friday", name: "Good Friday", description: "Remembering the cross.", icon: "✝️" },
  { slug: "revival", name: "Revival", description: "Renewal and spiritual awakening.", icon: "🔥" },
  { slug: "youth", name: "Youth", description: "Youth group worship songs.", icon: "🎸" },
  { slug: "funeral", name: "Funeral", description: "Comfort, hope, and remembrance.", icon: "🕊️" },
];

export const languages: Language[] = [
  { slug: "english", name: "English", nativeName: "English" },
  { slug: "assamese", name: "Assamese", nativeName: "অসমীয়া" },
  { slug: "bengali", name: "Bengali", nativeName: "বাংলা" },
  { slug: "bodo", name: "Bodo", nativeName: "बर'" },
  { slug: "dogri", name: "Dogri", nativeName: "डोगरी" },
  { slug: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી" },
  { slug: "hindi", name: "Hindi", nativeName: "हिंदी" },
  { slug: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { slug: "kashmiri", name: "Kashmiri", nativeName: "कॉशुर" },
  { slug: "konkani", name: "Konkani", nativeName: "कोंकणी" },
  { slug: "maithili", name: "Maithili", nativeName: "मैथिली" },
  { slug: "malayalam", name: "Malayalam", nativeName: "മലയാളം" },
  { slug: "manipuri", name: "Manipuri", nativeName: "मৈতৈলোন" },
  { slug: "marathi", name: "Marathi", nativeName: "मराठी" },
  { slug: "nepali", name: "Nepali", nativeName: "नेपाली" },
  { slug: "odia", name: "Odia", nativeName: "ଓଡ଼िଆ" },
  { slug: "punjabi", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { slug: "sanskrit", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { slug: "santali", name: "Santali", nativeName: "Santali" },
  { slug: "sindhi", name: "Sindhi", nativeName: "सिन्धी" },
  { slug: "tamil", name: "Tamil", nativeName: "தமிழ்" },
  { slug: "telugu", name: "Telugu", nativeName: "తెలుగు" },
  { slug: "urdu", name: "Urdu", nativeName: "اُردُو" }
];

export const songs: Song[] = [
  {
    slug: "morning-light-praise",
    title: "Morning Light Praise",
    category: "praise",
    language: "english",
    artist: "Grace Worship Band",
    excerpt: "A joyful song of thanks for a new day.",
    lyrics: `[Verse 1]
The morning light is shining bright
We lift our hearts in praise tonight
For every gift and every grace
We thank You, Lord, in this holy place

[Chorus]
Praise the Lord, our hearts rejoice
Lift your voice, lift your voice
Praise the Lord, our hearts rejoice
Lift your voice with one accord

[Verse 2]
Through every season, through every trial
Your faithful love makes our spirits smile
We gather here with grateful song
To You, O Lord, we all belong

[Chorus]
Praise the Lord, our hearts rejoice
Lift your voice, lift your voice
Praise the Lord, our hearts rejoice
Lift your voice with one accord`,
    addedDate: "2026-06-20",
    isPopular: true,
  },
  {
    slug: "holy-name-worship",
    title: "Holy Name Worship",
    category: "worship",
    language: "english",
    artist: "Bethel Singers",
    excerpt: "A gentle worship song honoring God's holy name.",
    lyrics: `[Verse 1]
Holy is Your name, O Lord
Holy is Your name
We bow before Your throne of grace
And worship without shame

[Chorus]
We worship You, we worship You
Our hearts belong to You alone
We worship You, we worship You
Before Your mercy throne

[Verse 2]
In quiet moments, in loud praise
We lift Your name on all our days
No other name can save our soul
You make the broken spirit whole

[Chorus]
We worship You, we worship You
Our hearts belong to You alone
We worship You, we worship You
Before Your mercy throne`,
    addedDate: "2026-06-18",
    isPopular: true,
  },
  {
    slug: "bread-and-cup",
    title: "Bread and Cup",
    category: "communion",
    language: "english",
    artist: "The Communion Choir",
    excerpt: "A communion song remembering Christ's sacrifice.",
    lyrics: `[Verse 1]
We take the bread, we drink the cup
Remembering what You gave for us
Your body broken, blood outpoured
Our Savior, Lord, and coming King

[Chorus]
This is the body, this is the blood
Given for us in perfect love
We remember, we proclaim
Until You come, Lord, come again

[Verse 2]
Around this table we are one
United by Your only Son
In fellowship and sacred peace
Our grateful worship shall not cease

[Chorus]
This is the body, this is the blood
Given for us in perfect love
We remember, we proclaim
Until You come, Lord, come again`,
    addedDate: "2026-06-15",
    isPopular: true,
  },
  {
    slug: "stuti-gaan",
    title: "Stuti Gaan",
    category: "revival",
    language: "hindi",
    artist: "Hindi Worship Collective",
    excerpt: "A Hindi praise song of thanksgiving.",
    lyrics: `[Verse 1]
Subah ki roshni mein hum gaayein
Tere naam ki stuti har din
Teri daya aur teri kripa
Se bhara hai yeh jeevan hamein

[Chorus]
Stuti karo, stuti karo
Prabhu ke naam ki stuti karo
Stuti karo, stuti karo
Prabhu ke naam ki stuti karo

[Verse 2]
Har pal mein teri mahima hai
Har din mein teri shanti hai
Tere saamne jhuk kar hum
Tera dhanyavaad gaate hain

[Chorus]
Stuti karo, stuti karo
Prabhu ke naam ki stuti karo
Stuti karo, stuti karo
Prabhu ke naam ki stuti karo`,
    addedDate: "2026-06-12",
    isPopular: false,
  },
  {
    slug: "aaraadhana-geet",
    title: "Aaraadhana Geet",
    category: "worship",
    language: "hindi",
    artist: "Aradhana Ministry",
    excerpt: "A Hindi worship song for quiet adoration.",
    lyrics: `[Verse 1]
Pavitra hai tera naam, Prabhu
Pavitra hai tera naam
Teri mahima ke saamne hum
Karte hain aaraadhana

[Chorus]
Hum tujhe aaraadhna karte hain
Tere saamne jhukte hain
Hum tujhe aaraadhna karte hain
Tere pyaar mein rehte hain

[Verse 2]
Shaant aur dheere hum gaate hain
Tere liye apna man lagate hain
Koi aur nahi, sirf tu hi
Hamara Prabhu, tu hi tu hi

[Chorus]
Hum tujhe aaraadhna karte hain
Tere saamne jhukte hain
Hum tujhe aaraadhna karte hain
Tere pyaar mein rehte hain`,
    addedDate: "2026-06-10",
    isPopular: true,
  },
  {
    slug: "prabhu-yanchi-stuti",
    title: "Prabhu Yanchi Stuti",
    category: "praise",
    language: "marathi",
    artist: "Marathi Praise Team",
    excerpt: "A Marathi praise song for church gatherings.",
    lyrics: `[Verse 1]
Sakal subha prabhatache gaan
Prabhu tujhi stuti karu aamhi
Tujhya kripene bharale jeevan
Tujhya charnanshi vinati karu

[Chorus]
Stuti kara, stuti kara
Prabhu yanchya naavachi stuti
Stuti kara, stuti kara
Ekach swarane gaata ya

[Verse 2]
Din bhar tujhi mahima aahe
Tujhi shanti aahe amhala
Tujhya samor jhukun amhi
Tujhe dhanyavaad deto

[Chorus]
Stuti kara, stuti kara
Prabhu yanchya naavachi stuti
Stuti kara, stuti kara
Ekach swarane gaata ya`,
    addedDate: "2026-06-08",
    isPopular: false,
  },
  {
    slug: "bhajan-sadhana",
    title: "Bhajan Sadhana",
    category: "worship",
    language: "marathi",
    excerpt: "A Marathi worship song for prayer meetings.",
    lyrics: `[Verse 1]
Pavitra aahe tujhe naav
Pavitra aahe tujhe naav
Tujhya mahime samor amhi
Karato aaraadhana

[Chorus]
Amhi tujhi aaraadhana karto
Tujhya samor jhukato
Amhi tujhi aaraadhana karto
Tujhya premat rahto

[Verse 2]
Shant manane amhi gaato
Tujhya khatir man lavato
Konach nahi, fakt tu
Amcha Prabhu, tu fakt tu

[Chorus]
Amhi tujhi aaraadhana karto
Tujhya samor jhukato
Amhi tujhi aaraadhana karto
Tujhya premat rahto`,
    addedDate: "2026-06-05",
    isPopular: false,
  },
  {
    slug: "remember-me-lord",
    title: "Remember Me, Lord",
    category: "communion",
    language: "english",
    artist: "Calvary Worship",
    excerpt: "A reflective communion song for Sunday service.",
    lyrics: `[Verse 1]
As we gather at this table
We remember what You did
The cross, the tomb, the risen Lord
Our Savior and our King

[Chorus]
Remember me, O Lord, remember me
As I remember You
Remember me, O Lord, remember me
In all I say and do

[Verse 2]
The bread we break, the cup we share
Proclaim Your death until You come
In unity we stand as one
Redeemed by Your great love

[Chorus]
Remember me, O Lord, remember me
As I remember You
Remember me, O Lord, remember me
In all I say and do`,
    addedDate: "2026-06-01",
    isPopular: false,
  },
  // ─── Additional Songs for A–Z Browsing ───────────────
  {
    slug: "amazing-grace-forever",
    title: "Amazing Grace Forever",
    category: "worship",
    language: "english",
    artist: "Heritage Worship",
    excerpt: "A modern arrangement of the timeless hymn of grace.",
    lyrics: `[Verse 1]
Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

[Chorus]
Forever grace, forever love
Forever mercy from above
Amazing grace will always be
The song that sets us free`,
    addedDate: "2026-05-28",
    isPopular: true,
  },
  {
    slug: "come-to-the-cross",
    title: "Come to the Cross",
    category: "worship",
    language: "english",
    artist: "Cross Worship Team",
    excerpt: "An invitation to find peace at the cross of Christ.",
    lyrics: `[Verse 1]
Come to the cross, lay your burdens down
Come to the cross, where mercy is found
In the shadow of His love we stand
Safe and secure in His mighty hand

[Chorus]
At the cross, at the cross
Where I first saw the light
At the cross, at the cross
Everything is made right`,
    addedDate: "2026-05-25",
    isPopular: false,
  },
  {
    slug: "draw-me-closer",
    title: "Draw Me Closer",
    category: "worship",
    language: "english",
    artist: "Deeper Life Worship",
    excerpt: "A prayer song seeking nearness to God.",
    lyrics: `[Verse 1]
Draw me closer, Lord, to You
In Your presence I am new
Every moment, every day
Teach me how to walk Your way

[Chorus]
Closer, closer to Your heart
Never let me drift apart
Draw me closer, Lord, I pray
Hold me near to You today`,
    addedDate: "2026-05-22",
    isPopular: false,
  },
  {
    slug: "everlasting-love",
    title: "Everlasting Love",
    category: "youth",
    language: "english",
    artist: "Eternal Praise Band",
    excerpt: "A praise song celebrating God's never-ending love.",
    lyrics: `[Verse 1]
Your love is everlasting
Your mercy never ends
From age to age unchanging
On You my heart depends

[Chorus]
Everlasting, never failing
Your love endures forever more
Everlasting, never changing
You are the God that I adore`,
    addedDate: "2026-05-20",
    isPopular: true,
  },
  {
    slug: "faithful-god",
    title: "Faithful God",
    category: "good_friday",
    language: "english",
    artist: "Faithpoint Music",
    excerpt: "A declaration of God's faithfulness through all seasons.",
    lyrics: `[Verse 1]
In every season You are faithful
In every moment You are near
Through every storm Your hand is steady
You cast away our doubt and fear

[Chorus]
Faithful God, faithful God
You never change, You never fail
Faithful God, faithful God
Your promises will always prevail`,
    addedDate: "2026-05-18",
    isPopular: false,
  },
  {
    slug: "glory-to-the-king",
    title: "Glory to the King",
    category: "easter",
    language: "english",
    artist: "Kingdom Worship",
    excerpt: "A powerful praise anthem exalting Christ as King.",
    lyrics: `[Verse 1]
Glory to the King of kings
Glory to the Lord of lords
Every nation, every tongue
Lifts their voice in one accord

[Chorus]
Glory, glory, hallelujah
Glory to the risen King
Glory, glory, hallelujah
Let the whole creation sing`,
    addedDate: "2026-05-15",
    isPopular: true,
  },
  {
    slug: "in-his-presence",
    title: "In His Presence",
    category: "worship",
    language: "english",
    artist: "Sanctuary Worship",
    excerpt: "A quiet worship song about dwelling in God's presence.",
    lyrics: `[Verse 1]
In His presence there is fullness of joy
In His presence every fear is destroyed
Come and worship, come and bow
In His presence, here and now

[Chorus]
Here I am, in Your presence
Here I stand, by Your grace
In Your presence, Lord, I find
Peace and rest for heart and mind`,
    addedDate: "2026-05-12",
    isPopular: false,
  },
  {
    slug: "jesus-my-savior",
    title: "Jesus My Savior",
    category: "worship",
    language: "english",
    artist: "New Life Music",
    excerpt: "A heartfelt declaration of faith in Jesus Christ.",
    lyrics: `[Verse 1]
Jesus my Savior, Jesus my Lord
Jesus the center of my world
You are the reason that I sing
To You my everything I bring

[Chorus]
Jesus, Jesus, precious name
Yesterday, today, the same
Jesus, Jesus, I believe
All Your promises I receive`,
    addedDate: "2026-05-10",
    isPopular: true,
  },
  {
    slug: "king-of-my-heart",
    title: "King of My Heart",
    category: "worship",
    language: "english",
    artist: "Heart of Worship",
    excerpt: "A surrender song making Jesus King of everything.",
    lyrics: `[Verse 1]
You are the King of my heart
You are the Lord of my days
I give You everything I am
And offer all my praise

[Chorus]
King of my heart, King of my soul
King of my life, You make me whole
I crown You Lord of everything
You are my God, my everything`,
    addedDate: "2026-05-08",
    isPopular: false,
  },
  {
    slug: "living-water",
    title: "Living Water",
    category: "worship",
    language: "english",
    artist: "Springs of Life",
    excerpt: "A song about the refreshing living water of Christ.",
    lyrics: `[Verse 1]
Like living water flowing free
Your Spirit fills the depths of me
I thirst no more, my soul is full
In You I find the beautiful

[Chorus]
Living water, flowing over
Living water, never dry
Fill me up and let me overflow
With Your love that never dies`,
    addedDate: "2026-05-05",
    isPopular: false,
  },
  {
    slug: "never-alone",
    title: "Never Alone",
    category: "funeral",
    language: "english",
    artist: "Promise Worship",
    excerpt: "A comforting song about God's constant companionship.",
    lyrics: `[Verse 1]
When the darkness closes in
And the road is hard to see
I will trust the One who holds me
He will never leave

[Chorus]
Never alone, never forsaken
Never alone, He is with me
Through the valley, through the fire
I am never alone`,
    addedDate: "2026-05-02",
    isPopular: false,
  },
  {
    slug: "o-come-let-us-adore",
    title: "O Come Let Us Adore",
    category: "christmas",
    language: "english",
    artist: "Christmas Worship Choir",
    excerpt: "A Christmas worship song for the advent season.",
    lyrics: `[Verse 1]
O come let us adore Him
The King of heaven born
In manger low He rested
That blessed Christmas morn

[Chorus]
Adore Him, adore Him
Christ the Lord is born
Adore Him, adore Him
On this Christmas morn`,
    addedDate: "2026-04-28",
    isPopular: false,
  },
  {
    slug: "surrender-all",
    title: "Surrender All",
    category: "worship",
    language: "english",
    artist: "Altar Worship",
    excerpt: "A song of complete surrender to God's will.",
    lyrics: `[Verse 1]
I lay it all before You, Lord
My plans, my dreams, my fears
I trust Your hand to guide my way
Through all my days and years

[Chorus]
I surrender all, I surrender all
Everything to You, my Lord
I surrender all, I surrender all
Take my life, it's Yours, O Lord`,
    addedDate: "2026-04-25",
    isPopular: true,
  },
  {
    slug: "thankful-heart",
    title: "Thankful Heart",
    category: "praise",
    language: "english",
    artist: "Gratitude Worship",
    excerpt: "A song of gratitude for God's blessings.",
    lyrics: `[Verse 1]
With a thankful heart I come to You
With a grateful song I sing
For every blessing old and new
My praise to You I bring

[Chorus]
Thank You, Lord, for all You've done
Thank You for Your precious Son
With a thankful heart I worship You
Your love forever true`,
    addedDate: "2026-04-22",
    isPopular: false,
  },
  {
    slug: "unchanging-god",
    title: "Unchanging God",
    category: "new_year",
    language: "english",
    artist: "Covenant Praise",
    excerpt: "A declaration of God's unchanging nature.",
    lyrics: `[Verse 1]
The mountains may be shaken
The seas may rise and fall
But You remain unchanging
The sovereign Lord of all

[Chorus]
Unchanging God, unmovable
Your word stands firm and true
Unchanging God, unshakeable
I put my trust in You`,
    addedDate: "2026-04-20",
    isPopular: false,
  },
  {
    slug: "worthy-is-the-lamb",
    title: "Worthy Is the Lamb",
    category: "worship",
    language: "english",
    artist: "Lamb of God Worship",
    excerpt: "A powerful worship song declaring Christ's worthiness.",
    lyrics: `[Verse 1]
Worthy is the Lamb who was slain
Worthy is the Lamb who overcame
Every tongue confess, every knee shall bow
Worthy is the Lamb, we worship now

[Chorus]
Worthy, worthy, worthy is the Lamb
Worthy, worthy, worthy is the Lamb
All glory and honor and power
Belong to the Lamb forever`,
    addedDate: "2026-04-18",
    isPopular: true,
  },
  {
    slug: "yeshu-masih-tere-naam",
    title: "Yeshu Masih Tere Naam",
    category: "worship",
    language: "hindi",
    artist: "Hindi Praise Fellowship",
    excerpt: "A Hindi worship song praising the name of Jesus.",
    lyrics: `[Verse 1]
Yeshu Masih tere naam mein
Shakti hai aur jeevan hai
Tera naam sab se uncha hai
Tu hi mera uddhaar hai

[Chorus]
Yeshu, Yeshu, Yeshu
Tera naam mahaan hai
Yeshu, Yeshu, Yeshu
Tu mera Prabhu mahaan hai`,
    addedDate: "2026-04-15",
    isPopular: false,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getLanguageBySlug(slug: string): Language | undefined {
  return languages.find((l) => l.slug === slug);
}

export function getSongBySlug(slug: string): Song | undefined {
  return songs.find((s) => s.slug === slug);
}

export function getRecentSongs(limit = 4): Song[] {
  return [...songs]
    .sort((a, b) => b.addedDate.localeCompare(a.addedDate))
    .slice(0, limit);
}

export function getPopularSongs(limit = 4): Song[] {
  return songs.filter((s) => s.isPopular).slice(0, limit);
}

export function getSongsByCategory(categorySlug: string): Song[] {
  return songs.filter((s) => s.category === categorySlug);
}

export function getSongsByLanguage(languageSlug: string): Song[] {
  return songs.filter((s) => s.language === languageSlug);
}

export function getRelatedSongs(song: Song, limit = 3): Song[] {
  return songs
    .filter(
      (s) =>
        s.slug !== song.slug &&
        (s.category === song.category || s.language === song.language)
    )
    .slice(0, limit);
}

export function getCategoryName(slug: string): string {
  if (!slug) return "";
  if (slug.includes(",")) {
    return slug
      .split(",")
      .map((s) => getCategoryBySlug(s.trim())?.name ?? s.trim())
      .join(", ");
  }
  return getCategoryBySlug(slug)?.name ?? slug;
}

export function getLanguageName(slug: string): string {
  return getLanguageBySlug(slug)?.name ?? slug;
}
