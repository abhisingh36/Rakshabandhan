/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          "Just For Diksha ✨" — Central Config              ║
 * ║                                                              ║
 * ║  Edit this file to personalise the entire experience.       ║
 * ║  No need to touch any 3D or scene code!                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const config = {
  // ── Names ──────────────────────────────────────────────────────────────────
  sisterName: "Diksha",
  cousinName: "Your cousin",   // ← Change this to your name if you want

  // ── Intro Sequence ─────────────────────────────────────────────────────────
  intro: {
    line1: "Hey Diksha...",
    line2: "I made a little something for you. 🌸",
    line3: "No, seriously... you have to see this.",
    buttonText: "Let's go ✨"
  },

  // ── Room hint (shown briefly after entering the room) ─────────────────────
  roomHint: "There's more here than you think... ✨",

  // ── Memories / Photo Frame ─────────────────────────────────────────────────
  // IMPORTANT: Place your photos in: public/assets/images/diksha/
  // Name them: memory1.jpg, memory2.jpg, ... and list them below.
  // If an image is missing, a warm placeholder card will show instead.
  memories: [
    {
      image: "/assets/images/diksha/memory1.jpg",
      caption: "Hum dono ki vibe alag hi hoti hai. 😄✌️",
      date: ""
    },
    {
      image: "/assets/images/diksha/memory2.jpg",
      caption: "Diksha ready for the event... aur clearly sab se sundar bhi. 💛✨",
      date: ""
    },
    {
      image: "/assets/images/diksha/memory3.jpg",
      caption: "Cake bhi hai, smile bhi hai — perfect combo. 🎂😊",
      date: ""
    },
    {
      image: "/assets/images/diksha/memory4.jpg",
      caption: "Ye wali photo toh meri favourite hai. 🧡",
      date: ""
    },
    {
      image: "/assets/images/diksha/memory5.jpg",
      caption: "Saath mein celebrate karna — best feeling. 🎉❤️",
      date: ""
    }
  ],

  memoriesTitle: "Some Moments With You ❤️",
  memoriesEnd: "Okay... enough memories for now. 😌",

  // ── Teddy Messages ─────────────────────────────────────────────────────────
  teddy: {
    message1: "Diksha, look what I found...",
    message2: "Cute hai na? 🐻\n\nPar honestly... tumse zyada cute koi nahi. 😊"
  },

  // ── Letter ─────────────────────────────────────────────────────────────────
  // Write your personal letter below. Use \n for line breaks.
  letter: {
    salutation: "Diksha,",
    content:
      "Kuch rishtey hote hain jo samjhaane ki zaroorat nahi hoti.\n\n" +
      "Bus hote hain — aur bahut khaas hote hain.\n\n" +
      "Humara bhi kuch aisa hi rishta hai.\n" +
      "Kabhi hassi, kabhi chhoti chhoti baatein,\n" +
      "kabhi bina kisi wajah ke sath time bitaana —\n" +
      "in sab mein jo maza aata hai, woh khaas hai.\n\n" +
      "Tumhe ye bata dena chahta tha ki\n" +
      "tumhari dosti aur saath meri zindagi ka\n" +
      "ek bahut important hissa hai.\n\n" +
      "Happy Raksha Bandhan, Diksha. ❤️",
    signature: "— Your chhotu bhaiya 😄"
  },

  // ── Rakhi Messages (3-step sequence) ──────────────────────────────────────
  rakhi: {
    message1: "Funny how one little thread can represent so much.",
    message2: "Family. Memories. Trust.\nAnd a bond that doesn't need much explanation.",
    message3: "Happy Raksha Bandhan, Diksha. ❤️"
  },

  // ── Flowers → Quiz transition ──────────────────────────────────────────────
  flowers: {
    message1: "Ek cheez bata doon...",
    message2: "Ab dekhtey hain Diksha ko kitna pata hai! 😊",
    buttonText: "Challenge Accept →"
  },

  // ── Quiz ───────────────────────────────────────────────────────────────────
  // To customise: edit the question, options, correctIndex (0-based), and responses.
  quizTitle: "Okay Diksha, let's see...",
  quizSubtitle: "How well do you actually know me? 😂",

  quiz: [
    {
      question: "What do I get annoyed about way too easily?",
      options: [
        "Someone eating my food 😤",
        "Being disturbed while sleeping",
        "My charger going missing",
        "All of the above, obviously"
      ],
      correctIndex: 3,
      correctResponse: "Okayyy, you actually know me. 😂❤️",
      wrongResponse: "Diksha... seriously? 😭"
    },
    {
      question: "Which one of us is more likely to start random fun?",
      options: [
        "Me obviously",
        "You (Diksha) 😌",
        "We take turns",
        "It just happens somehow"
      ],
      correctIndex: 1,
      correctResponse: "Honest answer! I appreciate that 😂",
      wrongResponse: "Try again... who starts it? 😌"
    },
    {
      question: "What's something I say way too often?",
      options: [
        "\"Haan haan, dekh lena\"",
        "\"Bas 5 minute\"",
        "\"Nahi yaar, aaj nahi\"",
        "\"Kal pakka\""
      ],
      correctIndex: 1,
      correctResponse: "Story of my life. 😂",
      wrongResponse: "Hmm, close but not quite. 😌"
    },
    {
      question: "If we had to describe our bond in one word, what would it be?",
      options: [
        "Chaotic 😂",
        "Wholesome",
        "Complicated",
        "Iconic 💅"
      ],
      correctIndex: 0,
      correctResponse: "YES. Chaotic. Perfectly said. 😂❤️",
      wrongResponse: "I mean... chaotic is more accurate. 😂"
    },
    {
      question: "Who is more dramatic between the two of us? 😌",
      options: [
        "Definitely you (Diksha) 💁‍♀️",
        "Definitely me",
        "We're equally dramatic tbh",
        "We don't do drama. We do impact."
      ],
      correctIndex: 3,
      correctResponse: "We don't do drama. WE DO IMPACT. 😂❤️",
      wrongResponse: "Wrong. We don't do drama, Diksha. We do IMPACT. 😂"
    }
  ],

  // Score-based finale messages (shown at end of quiz)
  quizScoreMessages: {
    perfect: {
      score: "5/5",
      message: "Okay. You actually know me.\n\nI'm genuinely impressed. 😂❤️\n\nI guess I'll keep you."
    },
    good: {
      score: "3–4/5",
      message: "Not bad, Diksha. 😌\n\nYou know me pretty well.\n\nI guess I'll keep you."
    },
    low: {
      score: "0–2/5",
      message: "Diksha... seriously? 😭\n\nWe need to have a conversation.\n\nBut okay fine, I'll still keep you. ❤️"
    }
  },

  // ── Gift Scene ─────────────────────────────────────────────────────────────
  gift: {
    line1: "Okay...",
    line2: "One last thing.",
    line3: "This one is actually for you. 🎁",
    tapHint: "Tap to open"
  },

  // ── Finale Messages (animated sequence) ───────────────────────────────────
  // Each string is a separate animated text moment.
  finale: {
    messages: [
      "Diksha...",
      "Life mein kuch rishtey hote hain\njinhe samjhaana nahi padta.",
      "Woh bas hote hain — aur khaas hote hain.",
      "Humara rishta bhi\nkuch aisa hi hai.",
      "Hassi bhari baatein.",
      "Pyaari yaadein.",
      "Aur ek dusre ka saath.",
      "Yahi toh sabse khaas hai. 😊",
      "Bahut khushi hoti hai\nye soch ke ki tum meri cousin ho...",
      "...aur usse bhi zyada khushi hoti hai\nki hum itne close hain.",
      "Happy Raksha Bandhan, Diksha. ❤️",
      "Hamesha aise hi rehna. ❤️"
    ],
    endTitle: "Made especially for Diksha ✨",
    endSubtitle: "With lots of love,\nfrom your cousin ❤️"
  },

  // ── Audio settings ─────────────────────────────────────────────────────────
  // Place your audio files in: public/assets/audio/
  audio: {
    bgm:     '/assets/audio/bgm.mp3',      // Warm, soft background music
    click:   '/assets/audio/click.mp3',
    sparkle: '/assets/audio/sparkle.mp3',
    success: '/assets/audio/success.mp3',
    wrong:   '/assets/audio/wrong.mp3',
    open:    '/assets/audio/open.mp3',
    bgmVolume: 0.3
  }
};
