import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/config";

import {
  ArrowRightIcon,
  BackIcon,
  DiaryIcon,
  WellbeingIcon,
} from "@/components/reweave-icons";

/* =========================================================
   TYPES
========================================================= */

type EmotionCategory =
  | "positive"
  | "calm"
  | "difficult";

type EmotionDetail = {
  slug: string;

  nameId: string;
  nameEn: string;

  category: EmotionCategory;

  image: string;
  color: string;

  descriptionId: string;
  descriptionEn: string;

  feelingsId: string[];
  feelingsEn: string[];

  bodySignalsId: string[];
  bodySignalsEn: string[];

  thoughtsId: string[];
  thoughtsEn: string[];

  reflectionId: string[];
  reflectionEn: string[];

  reminderId: string;
  reminderEn: string;
};

/* =========================================================
   EMOTION DATA
========================================================= */

const emotions: EmotionDetail[] = [
  {
    slug: "happy",
    nameId: "Senang",
    nameEn: "Happy",
    category: "positive",
    image: "/emotions-emoji/happy.png",
    color: "#FBC4AB",

    descriptionId:
      "Senang adalah perasaan yang terasa menyenangkan, ringan, atau membuat kita merasa lebih menikmati sesuatu. Perasaan ini bisa muncul ketika sesuatu berjalan sesuai harapan, ketika kita bersama orang yang berarti, atau ketika kita menghargai hal sederhana dalam hidup.",

    descriptionEn:
      "Happy is a pleasant feeling that can make things feel lighter or more enjoyable. It may appear when something goes as hoped, when we are with people who matter to us, or when we appreciate something simple in everyday life.",

    feelingsId: [
      "Lebih ringan secara emosional",
      "Lebih bersemangat melakukan sesuatu",
      "Ingin berbagi pengalaman dengan orang lain",
      "Lebih mudah menikmati momen saat ini",
    ],

    feelingsEn: [
      "Feeling emotionally lighter",
      "Having more energy to do things",
      "Wanting to share an experience with others",
      "Finding it easier to enjoy the present moment",
    ],

    bodySignalsId: [
      "Wajah terasa lebih rileks",
      "Tubuh terasa lebih ringan",
      "Energi terasa meningkat",
      "Lebih mudah tersenyum atau tertawa",
    ],

    bodySignalsEn: [
      "A more relaxed face",
      "A lighter feeling in the body",
      "More noticeable energy",
      "Finding it easier to smile or laugh",
    ],

    thoughtsId: [
      "Aku menikmati ini.",
      "Ini terasa menyenangkan.",
      "Aku ingin mengingat momen ini.",
    ],

    thoughtsEn: [
      "I am enjoying this.",
      "This feels good.",
      "I want to remember this moment.",
    ],

    reflectionId: [
      "Apa yang membuatku merasa senang hari ini?",
      "Apakah ada seseorang yang ingin aku apresiasi?",
      "Apa hal kecil yang ingin aku nikmati lebih lama?",
    ],

    reflectionEn: [
      "What made me feel happy today?",
      "Is there someone I want to appreciate?",
      "What small thing would I like to enjoy a little longer?",
    ],

    reminderId:
      "Kamu tidak harus mencari alasan besar untuk menghargai perasaan senang. Momen kecil juga layak diperhatikan.",

    reminderEn:
      "You do not need a big reason to appreciate happiness. Small moments are worth noticing too.",
  },

  {
    slug: "excited",
    nameId: "Antusias",
    nameEn: "Excited",
    category: "positive",
    image: "/emotions-emoji/excited.png",
    color: "#8F7163",

    descriptionId:
      "Antusias adalah perasaan penuh energi dan ketertarikan terhadap sesuatu yang sedang atau akan terjadi. Perasaan ini sering membuat kita ingin bergerak, mencoba, atau mengetahui lebih banyak.",

    descriptionEn:
      "Excitement is a feeling of energy and anticipation toward something that is happening or may happen. It can make us want to move, try something, or learn more.",

    feelingsId: [
      "Energi terasa meningkat",
      "Sulit menunggu sesuatu yang dinantikan",
      "Pikiran banyak tertuju pada hal yang akan datang",
      "Muncul dorongan untuk segera bertindak",
    ],

    feelingsEn: [
      "Feeling more energetic",
      "Finding it difficult to wait for something anticipated",
      "Thinking frequently about what is coming",
      "Feeling motivated to act",
    ],

    bodySignalsId: [
      "Jantung terasa berdetak lebih cepat",
      "Tubuh terasa lebih aktif",
      "Sulit diam karena banyak energi",
      "Tidur atau istirahat bisa terasa lebih sulit ketika sangat bersemangat",
    ],

    bodySignalsEn: [
      "A faster-feeling heartbeat",
      "Feeling physically more active",
      "Having difficulty sitting still because of energy",
      "Resting may feel harder when anticipation is very high",
    ],

    thoughtsId: [
      "Aku tidak sabar menunggunya.",
      "Bagaimana kalau ini benar-benar terjadi?",
      "Aku ingin segera mencobanya.",
    ],

    thoughtsEn: [
      "I cannot wait for it.",
      "What if this really happens?",
      "I want to try it soon.",
    ],

    reflectionId: [
      "Apa yang sedang membuatku bersemangat?",
      "Apa yang bisa kulakukan agar antusiasmeku tetap sehat dan realistis?",
      "Apa langkah kecil yang bisa kulakukan sekarang?",
    ],

    reflectionEn: [
      "What is making me feel excited?",
      "How can I keep this excitement healthy and realistic?",
      "What small step can I take now?",
    ],

    reminderId:
      "Antusias bisa menjadi sumber energi. Nikmati energinya sambil tetap memberi ruang untuk beristirahat dan melihat situasi dengan tenang.",

    reminderEn:
      "Excitement can be a source of energy. Enjoy it while still making room for rest and perspective.",
  },

  {
    slug: "grateful",
    nameId: "Bersyukur",
    nameEn: "Grateful",
    category: "positive",
    image: "/emotions-emoji/grateful.png",
    color: "#D6E3D5",

    descriptionId:
      "Bersyukur adalah perasaan menghargai sesuatu yang dianggap berarti atau baik dalam hidup. Hal yang disyukuri tidak harus besar; bisa berupa seseorang, kesempatan, pengalaman, atau hal sederhana.",

    descriptionEn:
      "Gratitude is a feeling of appreciating something that feels meaningful or good in life. What we appreciate does not have to be big; it can be a person, opportunity, experience, or simple moment.",

    feelingsId: [
      "Merasa hangat ketika mengingat sesuatu",
      "Lebih menyadari hal baik yang sudah dimiliki",
      "Merasa ingin menghargai seseorang",
      "Merasakan kepuasan terhadap sesuatu yang sederhana",
    ],

    feelingsEn: [
      "Feeling warmth when remembering something",
      "Noticing good things already present in life",
      "Wanting to appreciate someone",
      "Feeling content with something simple",
    ],

    bodySignalsId: [
      "Tubuh terasa lebih rileks",
      "Pikiran terasa lebih tenang",
      "Napas terasa lebih nyaman",
      "Muncul rasa hangat atau nyaman",
    ],

    bodySignalsEn: [
      "Feeling more physically relaxed",
      "A calmer mental state",
      "More comfortable breathing",
      "A sense of warmth or comfort",
    ],

    thoughtsId: [
      "Aku menghargai hal ini.",
      "Aku beruntung memiliki pengalaman ini.",
      "Aku ingin berterima kasih kepada seseorang.",
    ],

    thoughtsEn: [
      "I appreciate this.",
      "I am grateful to have experienced this.",
      "I want to thank someone.",
    ],

    reflectionId: [
      "Hal apa yang paling aku hargai hari ini?",
      "Siapa yang membuat hariku sedikit lebih baik?",
      "Pengalaman sederhana apa yang ingin aku ingat?",
    ],

    reflectionEn: [
      "What do I appreciate most today?",
      "Who made my day a little better?",
      "What simple experience would I like to remember?",
    ],

    reminderId:
      "Bersyukur bukan berarti mengabaikan hal yang sulit. Kamu tetap boleh merasakan emosi lain sambil menghargai hal yang baik.",

    reminderEn:
      "Gratitude does not mean ignoring difficult things. You can appreciate something good while still experiencing other emotions.",
  },

  {
    slug: "calm",
    nameId: "Tenang",
    nameEn: "Calm",
    category: "calm",
    image: "/emotions-emoji/calm.png",
    color: "#B1C5B1",

    descriptionId:
      "Tenang adalah keadaan ketika tubuh dan pikiran terasa lebih stabil, tidak terlalu terburu-buru, dan memiliki ruang untuk merespons sesuatu dengan lebih perlahan.",

    descriptionEn:
      "Calm is a state in which the body and mind feel more settled, less rushed, and able to respond with more space.",

    feelingsId: [
      "Pikiran terasa lebih jernih",
      "Tidak terlalu terdorong untuk bereaksi cepat",
      "Lebih mudah menikmati keadaan sekitar",
      "Tubuh terasa lebih rileks",
    ],

    feelingsEn: [
      "A clearer mind",
      "Less urgency to react immediately",
      "Finding it easier to notice the surroundings",
      "Feeling more physically relaxed",
    ],

    bodySignalsId: [
      "Napas terasa lebih stabil",
      "Bahu dan rahang lebih rileks",
      "Detak tubuh terasa lebih teratur",
      "Gerakan terasa lebih perlahan",
    ],

    bodySignalsEn: [
      "More settled breathing",
      "Relaxed shoulders and jaw",
      "A steadier physical feeling",
      "Slower and more deliberate movements",
    ],

    thoughtsId: [
      "Aku bisa mengambil waktu sebentar.",
      "Aku tidak harus langsung bereaksi.",
      "Aku bisa menghadapi ini satu langkah demi satu langkah.",
    ],

    thoughtsEn: [
      "I can take a moment.",
      "I do not have to react immediately.",
      "I can handle this one step at a time.",
    ],

    reflectionId: [
      "Apa yang membantu tubuhku terasa lebih tenang?",
      "Kapan terakhir kali aku benar-benar memberi diriku waktu?",
      "Apa yang ingin aku pertahankan dari keadaan ini?",
    ],

    reflectionEn: [
      "What helps my body feel calmer?",
      "When was the last time I genuinely gave myself time?",
      "What would I like to carry forward from this state?",
    ],

    reminderId:
      "Tenang bukan berarti semua masalah sudah selesai. Kadang tenang berarti kita punya cukup ruang untuk menghadapinya.",

    reminderEn:
      "Being calm does not mean every problem is solved. Sometimes calm simply gives us enough space to face what is happening.",
  },

  {
    slug: "tired",
    nameId: "Lelah",
    nameEn: "Tired",
    category: "difficult",
    image: "/emotions-emoji/tired.png",
    color: "#879C87",

    descriptionId:
      "Lelah adalah perasaan ketika energi terasa berkurang setelah aktivitas fisik, pekerjaan mental, tuntutan sehari-hari, atau waktu istirahat yang belum cukup.",

    descriptionEn:
      "Tiredness is a feeling of reduced energy after physical activity, mental effort, everyday demands, or insufficient rest.",

    feelingsId: [
      "Energi terasa rendah",
      "Sulit mempertahankan fokus",
      "Ingin berhenti atau beristirahat",
      "Hal sederhana terasa membutuhkan lebih banyak usaha",
    ],

    feelingsEn: [
      "Low energy",
      "Difficulty maintaining focus",
      "Wanting to stop or rest",
      "Simple things requiring more effort",
    ],

    bodySignalsId: [
      "Tubuh terasa berat",
      "Mata terasa lelah",
      "Gerakan menjadi lebih lambat",
      "Muncul keinginan untuk tidur atau berbaring",
    ],

    bodySignalsEn: [
      "A heavy feeling in the body",
      "Tired eyes",
      "Slower movements",
      "Wanting to sleep or lie down",
    ],

    thoughtsId: [
      "Aku butuh istirahat.",
      "Aku sulit fokus sekarang.",
      "Aku ingin menyelesaikan semuanya, tapi energiku terbatas.",
    ],

    thoughtsEn: [
      "I need some rest.",
      "It is hard to focus right now.",
      "I want to finish everything, but my energy is limited.",
    ],

    reflectionId: [
      "Apa yang paling menguras energiku hari ini?",
      "Apakah tubuhku sedang meminta waktu untuk beristirahat?",
      "Apa satu hal yang bisa kutunda?",
    ],

    reflectionEn: [
      "What used the most of my energy today?",
      "Is my body asking for some rest?",
      "What is one thing I could postpone?",
    ],

    reminderId:
      "Istirahat bukan tanda gagal. Energi juga memiliki batas, dan memperhatikan batas itu adalah bagian dari merawat diri.",

    reminderEn:
      "Rest is not a sign of failure. Energy has limits, and noticing those limits is part of taking care of yourself.",
  },

  {
    slug: "anxious",
    nameId: "Cemas",
    nameEn: "Anxious",
    category: "difficult",
    image: "/emotions-emoji/anxious.png",
    color: "#D66F5A",

    descriptionId:
      "Cemas adalah perasaan khawatir atau tidak tenang yang dapat muncul ketika menghadapi ketidakpastian, kemungkinan yang belum terjadi, atau sesuatu yang terasa mengancam.",

    descriptionEn:
      "Anxiety is a feeling of worry or unease that can appear when facing uncertainty, possible future events, or something that feels threatening.",

    feelingsId: [
      "Pikiran terus memikirkan kemungkinan",
      "Sulit merasa benar-benar tenang",
      "Ingin memastikan sesuatu berulang kali",
      "Merasa perlu bersiap menghadapi sesuatu",
    ],

    feelingsEn: [
      "Thinking repeatedly about possibilities",
      "Finding it difficult to fully relax",
      "Wanting to check or make sure repeatedly",
      "Feeling a need to prepare for something",
    ],

    bodySignalsId: [
      "Jantung terasa berdebar",
      "Otot terasa tegang",
      "Napas terasa berubah",
      "Perut terasa tidak nyaman",
    ],

    bodySignalsEn: [
      "A faster-feeling heartbeat",
      "Muscle tension",
      "Changes in breathing",
      "An uncomfortable feeling in the stomach",
    ],

    thoughtsId: [
      "Bagaimana kalau sesuatu yang buruk terjadi?",
      "Aku harus memastikan semuanya aman.",
      "Aku belum tahu apa yang akan terjadi.",
    ],

    thoughtsEn: [
      "What if something bad happens?",
      "I need to make sure everything is okay.",
      "I do not know what will happen.",
    ],

    reflectionId: [
      "Hal apa yang sebenarnya sedang aku khawatirkan?",
      "Mana yang bisa kukendalikan dan mana yang belum bisa?",
      "Apa satu hal yang bisa kulakukan sekarang?",
    ],

    reflectionEn: [
      "What am I actually worried about?",
      "What can I control and what can I not control yet?",
      "What is one thing I can do right now?",
    ],

    reminderId:
      "Cemas bisa menjadi respons terhadap ketidakpastian. Perasaan ini tidak otomatis berarti sesuatu yang buruk akan terjadi.",

    reminderEn:
      "Anxiety can be a response to uncertainty. Feeling anxious does not automatically mean something bad will happen.",
  },

  {
    slug: "stressed",
    nameId: "Stres",
    nameEn: "Stressed",
    category: "difficult",
    image: "/emotions-emoji/stressed.png",
    color: "#A64D3B",

    descriptionId:
      "Stres adalah keadaan ketika tuntutan atau tekanan yang dihadapi terasa berat untuk dikelola dengan sumber daya yang tersedia saat itu.",

    descriptionEn:
      "Stress can happen when the demands or pressures we face feel difficult to manage with the resources available to us at that time.",

    feelingsId: [
      "Merasa banyak hal harus diselesaikan",
      "Sulit mematikan pikiran tentang pekerjaan atau tanggung jawab",
      "Mudah merasa tegang",
      "Merasa waktu tidak pernah cukup",
    ],

    feelingsEn: [
      "Feeling like many things need to be handled",
      "Finding it difficult to switch off thoughts about work or responsibilities",
      "Feeling tense easily",
      "Feeling like there is never enough time",
    ],

    bodySignalsId: [
      "Otot terasa tegang",
      "Sakit kepala atau tubuh terasa tidak nyaman",
      "Sulit rileks",
      "Energi cepat terkuras",
    ],

    bodySignalsEn: [
      "Muscle tension",
      "Headaches or physical discomfort",
      "Difficulty relaxing",
      "Energy being drained quickly",
    ],

    thoughtsId: [
      "Aku harus menyelesaikan semuanya.",
      "Terlalu banyak yang harus dipikirkan.",
      "Aku tidak tahu harus mulai dari mana.",
    ],

    thoughtsEn: [
      "I have to finish everything.",
      "There is too much to think about.",
      "I do not know where to start.",
    ],

    reflectionId: [
      "Apa sumber tekanan terbesar saat ini?",
      "Apa yang benar-benar perlu diselesaikan hari ini?",
      "Apa yang bisa dibagi, ditunda, atau dilepas?",
    ],

    reflectionEn: [
      "What is the biggest source of pressure right now?",
      "What genuinely needs to be done today?",
      "What could be shared, postponed, or let go?",
    ],

    reminderId:
      "Saat banyak hal terasa mendesak, memecahnya menjadi satu langkah kecil bisa membantu menciptakan sedikit ruang.",

    reminderEn:
      "When everything feels urgent, breaking things into one small step can create a little more space.",
  },

  {
    slug: "angry",
    nameId: "Marah",
    nameEn: "Angry",
    category: "difficult",
    image: "/emotions-emoji/angry.png",
    color: "#782E20",

    descriptionId:
      "Marah adalah emosi kuat yang dapat muncul ketika sesuatu terasa tidak adil, mengganggu, menyakiti, mengecewakan, atau melewati batas yang penting bagi kita.",

    descriptionEn:
      "Anger is a strong emotion that can appear when something feels unfair, disruptive, hurtful, disappointing, or crosses an important boundary.",

    feelingsId: [
      "Dorongan kuat untuk bereaksi",
      "Merasa sesuatu harus segera diperbaiki",
      "Sulit menerima keadaan saat itu",
      "Merasa batas pribadi telah dilanggar",
    ],

    feelingsEn: [
      "A strong urge to react",
      "Feeling that something needs to be fixed immediately",
      "Difficulty accepting the situation",
      "Feeling that an important boundary has been crossed",
    ],

    bodySignalsId: [
      "Tubuh terasa panas",
      "Rahang atau tangan menegang",
      "Jantung terasa lebih cepat",
      "Energi terasa meningkat",
    ],

    bodySignalsEn: [
      "Feeling physically warm",
      "Tension in the jaw or hands",
      "A faster-feeling heartbeat",
      "A noticeable increase in energy",
    ],

    thoughtsId: [
      "Ini tidak seharusnya terjadi.",
      "Aku merasa diperlakukan tidak adil.",
      "Aku ingin sesuatu berubah sekarang.",
    ],

    thoughtsEn: [
      "This should not have happened.",
      "I feel like I was treated unfairly.",
      "I want something to change now.",
    ],

    reflectionId: [
      "Batas apa yang terasa dilanggar?",
      "Apa yang sebenarnya ada di balik kemarahanku?",
      "Apa yang ingin kusampaikan tanpa memperburuk keadaan?",
    ],

    reflectionEn: [
      "What boundary feels like it was crossed?",
      "What might be underneath my anger?",
      "What do I want to communicate without making things worse?",
    ],

    reminderId:
      "Marah dapat memberi informasi bahwa ada sesuatu yang penting bagimu. Kamu tetap punya pilihan tentang bagaimana meresponsnya.",

    reminderEn:
      "Anger can give information that something matters to you. You still have choices about how to respond.",
  },

  {
    slug: "frustrated",
    nameId: "Frustrasi",
    nameEn: "Frustrated",
    category: "difficult",
    image: "/emotions-emoji/frustrated.png",
    color: "#A64D3B",

    descriptionId:
      "Frustrasi dapat muncul ketika usaha, harapan, atau kebutuhan kita terhambat dan sesuatu tidak berjalan seperti yang diinginkan.",

    descriptionEn:
      "Frustration can appear when our efforts, expectations, or needs are blocked and something does not go as hoped.",

    feelingsId: [
      "Kesal karena sesuatu tidak berjalan",
      "Merasa usaha tidak menghasilkan perubahan",
      "Ingin menyerah atau berhenti",
      "Sulit menerima hambatan",
    ],

    feelingsEn: [
      "Feeling irritated when something does not work",
      "Feeling that effort is not producing change",
      "Wanting to give up or stop",
      "Finding obstacles difficult to accept",
    ],

    bodySignalsId: [
      "Tubuh terasa tegang",
      "Mudah menghela napas",
      "Gelisah",
      "Energi terasa tertahan",
    ],

    bodySignalsEn: [
      "Physical tension",
      "Sighing more often",
      "Restlessness",
      "Feeling like energy is stuck",
    ],

    thoughtsId: [
      "Kenapa ini tidak berhasil?",
      "Aku sudah mencoba.",
      "Aku ingin semuanya berjalan sesuai rencana.",
    ],

    thoughtsEn: [
      "Why is this not working?",
      "I have already tried.",
      "I want this to go according to plan.",
    ],

    reflectionId: [
      "Apa yang sebenarnya kuharapkan?",
      "Bagian mana yang masih bisa kukendalikan?",
      "Apakah aku perlu mencoba pendekatan yang berbeda?",
    ],

    reflectionEn: [
      "What was I actually expecting?",
      "What part can I still control?",
      "Would a different approach help?",
    ],

    reminderId:
      "Frustrasi bisa menunjukkan bahwa sesuatu penting bagimu. Kamu tidak harus menyelesaikan semuanya dalam satu percobaan.",

    reminderEn:
      "Frustration can show that something matters to you. You do not have to solve everything in one attempt.",
  },

  {
    slug: "lonely",
    nameId: "Kesepian",
    nameEn: "Lonely",
    category: "difficult",
    image: "/emotions-emoji/lonely.png",
    color: "#7182A4",

    descriptionId:
      "Kesepian adalah perasaan kurang terhubung atau kurang memiliki hubungan yang terasa berarti. Seseorang dapat merasa kesepian meskipun sedang berada di sekitar banyak orang.",

    descriptionEn:
      "Loneliness is a feeling of lacking meaningful connection. A person can feel lonely even while surrounded by other people.",

    feelingsId: [
      "Merasa tidak benar-benar dipahami",
      "Ingin memiliki seseorang untuk diajak bicara",
      "Merasa jauh dari orang lain",
      "Merasa hadir tetapi tidak terhubung",
    ],

    feelingsEn: [
      "Feeling not truly understood",
      "Wanting someone to talk to",
      "Feeling distant from others",
      "Being present but not feeling connected",
    ],

    bodySignalsId: [
      "Energi terasa menurun",
      "Tubuh terasa berat",
      "Ingin menarik diri",
      "Muncul rasa kosong atau tidak nyaman",
    ],

    bodySignalsEn: [
      "Lower energy",
      "A heavy physical feeling",
      "Wanting to withdraw",
      "A sense of emptiness or discomfort",
    ],

    thoughtsId: [
      "Tidak ada yang benar-benar mengerti aku.",
      "Aku ingin punya seseorang untuk bicara.",
      "Aku merasa sendirian meskipun ada orang lain.",
    ],

    thoughtsEn: [
      "No one really understands me.",
      "I wish I had someone to talk to.",
      "I feel alone even when other people are around.",
    ],

    reflectionId: [
      "Hubungan seperti apa yang sebenarnya sedang kubutuhkan?",
      "Apakah ada seseorang yang cukup aman untuk kuhubungi?",
      "Apa langkah kecil untuk merasa sedikit lebih terhubung?",
    ],

    reflectionEn: [
      "What kind of connection do I actually need?",
      "Is there someone safe enough for me to reach out to?",
      "What small step could help me feel a little more connected?",
    ],

    reminderId:
      "Kesepian bukan berarti kamu tidak berharga. Perasaan terhubung membutuhkan waktu, kesempatan, dan hubungan yang terasa aman.",

    reminderEn:
      "Loneliness does not mean you are unworthy. Feeling connected can take time, opportunity, and relationships that feel safe.",
  },

  {
    slug: "sad",
    nameId: "Sedih",
    nameEn: "Sad",
    category: "difficult",
    image: "/emotions-emoji/sad.png",
    color: "#475677",

    descriptionId:
      "Sedih adalah perasaan berat yang dapat muncul ketika mengalami kehilangan, kekecewaan, perpisahan, luka emosional, atau keadaan yang tidak sesuai harapan.",

    descriptionEn:
      "Sadness is a heavy feeling that can arise from loss, disappointment, separation, emotional hurt, or circumstances that do not go as hoped.",

    feelingsId: [
      "Energi terasa menurun",
      "Ingin menangis atau menyendiri",
      "Hal yang biasanya menyenangkan terasa kurang menarik",
      "Membutuhkan waktu untuk memproses sesuatu",
    ],

    feelingsEn: [
      "Lower energy",
      "Wanting to cry or be alone",
      "Normally enjoyable things feeling less interesting",
      "Needing time to process something",
    ],

    bodySignalsId: [
      "Tubuh terasa berat",
      "Gerakan lebih lambat",
      "Dada terasa penuh atau berat",
      "Mudah merasa lelah",
    ],

    bodySignalsEn: [
      "A heavy feeling in the body",
      "Slower movements",
      "A full or heavy feeling in the chest",
      "Feeling tired more easily",
    ],

    thoughtsId: [
      "Aku berharap semuanya berbeda.",
      "Aku masih memikirkan apa yang terjadi.",
      "Aku butuh waktu untuk menerima ini.",
    ],

    thoughtsEn: [
      "I wish things were different.",
      "I am still thinking about what happened.",
      "I need time to process this.",
    ],

    reflectionId: [
      "Apa yang sebenarnya sedang aku kehilangan atau rindukan?",
      "Apa yang ingin aku izinkan diriku rasakan?",
      "Siapa yang bisa menjadi tempat aman untuk bercerita?",
    ],

    reflectionEn: [
      "What am I actually losing or missing?",
      "What feeling do I need to allow myself to experience?",
      "Who could be a safe person to talk to?",
    ],

    reminderId:
      "Sedih tidak selalu harus segera diperbaiki. Kadang perasaan ini membutuhkan ruang untuk dirasakan dan dipahami.",

    reminderEn:
      "Sadness does not always need to be fixed immediately. Sometimes it needs space to be felt and understood.",
  },

  {
    slug: "overwhelmed",
    nameId: "Kewalahan",
    nameEn: "Overwhelmed",
    category: "difficult",
    image: "/emotions-emoji/overwhelmed.png",
    color: "#39405B",

    descriptionId:
      "Kewalahan adalah perasaan ketika banyak tuntutan, informasi, emosi, atau masalah datang bersamaan sehingga sulit mengetahui harus mulai dari mana.",

    descriptionEn:
      "Feeling overwhelmed can happen when many demands, information, emotions, or problems arrive at once and it becomes difficult to know where to begin.",

    feelingsId: [
      "Merasa terlalu banyak hal yang harus dilakukan",
      "Sulit menentukan prioritas",
      "Ingin berhenti dari semuanya sebentar",
      "Hal kecil terasa ikut membebani",
    ],

    feelingsEn: [
      "Feeling like there is too much to do",
      "Difficulty deciding what to prioritize",
      "Wanting to step away from everything for a while",
      "Small things also starting to feel heavy",
    ],

    bodySignalsId: [
      "Tubuh terasa tegang",
      "Sulit duduk tenang",
      "Napas terasa pendek atau cepat",
      "Energi cepat habis",
    ],

    bodySignalsEn: [
      "Physical tension",
      "Difficulty sitting still",
      "Breathing may feel faster or shallower",
      "Energy being depleted quickly",
    ],

    thoughtsId: [
      "Semuanya harus selesai sekarang.",
      "Aku tidak tahu harus mulai dari mana.",
      "Terlalu banyak yang terjadi.",
    ],

    thoughtsEn: [
      "Everything needs to be done now.",
      "I do not know where to start.",
      "There is too much happening.",
    ],

    reflectionId: [
      "Apa yang benar-benar paling penting sekarang?",
      "Apa satu hal yang bisa kuselesaikan terlebih dahulu?",
      "Apa yang bisa menunggu sampai nanti?",
    ],

    reflectionEn: [
      "What is actually most important right now?",
      "What is one thing I can handle first?",
      "What can wait until later?",
    ],

    reminderId:
      "Ketika semuanya terasa terlalu banyak, kamu tidak harus menyelesaikan semuanya sekaligus. Mulai dari satu hal yang paling dekat.",

    reminderEn:
      "When everything feels like too much, you do not have to solve everything at once. Start with the one thing closest to you.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getEmotion(
  slug: string,
) {
  return emotions.find(
    (emotion) =>
      emotion.slug ===
      slug.toLowerCase(),
  );
}

function getCategoryLabel(
  category: EmotionCategory,
  isEnglish: boolean,
) {
  if (category === "positive") {
    return isEnglish
      ? "Positive emotion"
      : "Emosi positif";
  }

  if (category === "calm") {
    return isEnglish
      ? "Calm state"
      : "Keadaan tenang";
  }

  return isEnglish
    ? "Difficult emotion"
    : "Emosi yang tidak nyaman";
}

/* =========================================================
   PAGE
========================================================= */

export default async function EmotionDetailPage({
  params,
}: {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}) {
  const { locale, slug } =
    await params;

  const emotion =
    getEmotion(slug);

  if (!emotion) {
    notFound();
  }

  const isEnglish =
    locale === "en";

  const name = isEnglish
    ? emotion.nameEn
    : emotion.nameId;

  const description =
    isEnglish
      ? emotion.descriptionEn
      : emotion.descriptionId;

  const feelings =
    isEnglish
      ? emotion.feelingsEn
      : emotion.feelingsId;

  const bodySignals =
    isEnglish
      ? emotion.bodySignalsEn
      : emotion.bodySignalsId;

  const thoughts =
    isEnglish
      ? emotion.thoughtsEn
      : emotion.thoughtsId;

  const reflections =
    isEnglish
      ? emotion.reflectionEn
      : emotion.reflectionId;

  const reminder =
    isEnglish
      ? emotion.reminderEn
      : emotion.reminderId;

  return (
    <main className="min-h-full bg-[#FDFBF7] pb-20 text-[#4A3F35]">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

        {/* =================================================
            BACK
        ================================================== */}

        <Link
          href={`/${locale}/emotions`}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-[#4A3F35]/45 transition-colors hover:text-[#4A3F35]"
        >
          <BackIcon className="h-4 w-4" />

          {isEnglish
            ? "Back to emotions"
            : "Kembali ke emosi"}
        </Link>

        {/* =================================================
            HERO
        ================================================== */}

        <section
          className="relative mt-10 overflow-hidden rounded-[32px] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16"
          style={{
            backgroundColor: `${emotion.color}55`,
          }}
        >
          {/* decorative circle */}

          <div
            className="absolute -right-24 -top-28 h-80 w-80 rounded-full opacity-40"
            style={{
              backgroundColor:
                "#FDFBF7",
            }}
          />

          <div
            className="absolute -bottom-24 left-[30%] h-52 w-52 rounded-full opacity-25"
            style={{
              backgroundColor:
                "#C1D5C0",
            }}
          />

          <div className="relative grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">

            {/* ARTWORK */}

            <div className="flex justify-center md:justify-start">
              <div
                className="flex h-48 w-48 items-center justify-center rounded-[38px] sm:h-56 sm:w-56"
                style={{
                  backgroundColor:
                    `${emotion.color}88`,
                }}
              >
                <Image
                  src={emotion.image}
                  alt={name}
                  width={190}
                  height={190}
                  priority
                  className="h-[175px] w-[175px] object-contain mix-blend-multiply sm:h-[205px] sm:w-[205px]"
                />
              </div>
            </div>

            {/* CONTENT */}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDFBF7]/65 text-[#5C6B9C]">
                  <WellbeingIcon className="h-[18px] w-[18px]" />
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#5C6B9C]">
                  {getCategoryLabel(
                    emotion.category,
                    isEnglish,
                  )}
                </p>
              </div>

              <h1 className="mt-5 text-[42px] font-semibold leading-none tracking-[-0.05em] sm:text-[58px]">
                {name}
              </h1>

              <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#4A3F35]/70 sm:text-[16px]">
                {description}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            INTRO NOTE
        ================================================== */}

        <section className="mt-10 border-y border-[#C1D5C0]/55 py-7">
          <div className="flex gap-4">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  emotion.color,
              }}
            />

            <p className="max-w-3xl text-sm leading-7 text-[#4A3F35]/60">
              {isEnglish
                ? "Emotions can provide information about our experience, needs, boundaries, or what matters to us. The same emotion can feel different from one person to another."
                : "Emosi dapat memberi informasi tentang pengalaman, kebutuhan, batas, atau sesuatu yang penting bagi kita. Emosi yang sama juga bisa terasa berbeda pada setiap orang."}
            </p>
          </div>
        </section>

        {/* =================================================
            WHAT IT MAY FEEL LIKE
        ================================================== */}

        <section className="mt-14">
          <SectionHeading
            eyebrow={
              isEnglish
                ? "Notice"
                : "Perhatikan"
            }
            title={
              isEnglish
                ? "What might this feel like?"
                : "Seperti apa rasanya?"
            }
          />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {feelings.map(
              (item, index) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[#C1D5C0]/55 bg-white p-5"
                >
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color:
                        emotion.color,
                    }}
                  >
                    0{index + 1}
                  </span>

                  <p className="mt-3 text-sm leading-6 text-[#4A3F35]/70">
                    {item}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =================================================
            BODY
        ================================================== */}

        <section className="mt-14">
          <SectionHeading
            eyebrow={
              isEnglish
                ? "In your body"
                : "Di tubuhmu"
            }
            title={
              isEnglish
                ? "Your body may notice it too."
                : "Tubuhmu juga bisa merasakannya."
            }
          />

          <div className="mt-7 rounded-[24px] bg-[#C1D5C0]/25 p-6 sm:p-8">
            <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {bodySignals.map(
                (item) => (
                  <div
                    key={item}
                    className="flex gap-3"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          emotion.color,
                      }}
                    />

                    <p className="text-sm leading-7 text-[#4A3F35]/65">
                      {item}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            THOUGHTS
        ================================================== */}

        <section className="mt-14">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">

            <SectionHeading
              eyebrow={
                isEnglish
                  ? "In your mind"
                  : "Di pikiranmu"
              }
              title={
                isEnglish
                  ? "Thoughts can change with the feeling."
                  : "Pikiran juga bisa ikut berubah."
              }
            />

            <div className="border-l-2 pl-6 sm:pl-8">
              <div className="space-y-5">
                {thoughts.map(
                  (thought) => (
                    <p
                      key={thought}
                      className="text-[17px] leading-8 text-[#4A3F35]/70"
                    >
                      “{thought}”
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REFLECTION
        ================================================== */}

        <section className="mt-16 rounded-[28px] bg-[#4A3F35] px-6 py-9 text-[#FDFBF7] sm:px-10 sm:py-11">
          <div className="grid gap-9 lg:grid-cols-[0.75fr_1.25fr]">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FBC4AB]">
                {isEnglish
                  ? "A moment to reflect"
                  : "Waktu untuk berefleksi"}
              </p>

              <h2 className="mt-3 text-[27px] font-semibold leading-tight tracking-[-0.035em]">
                {isEnglish
                  ? "You don't have to solve the feeling."
                  : "Kamu tidak harus langsung menyelesaikan perasaan ini."}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#FDFBF7]/55">
                {isEnglish
                  ? "Sometimes noticing what is happening is already a useful first step."
                  : "Terkadang menyadari apa yang sedang terjadi sudah menjadi langkah awal yang berarti."}
              </p>
            </div>

            <div className="space-y-3">
              {reflections.map(
                (question, index) => (
                  <div
                    key={question}
                    className="flex gap-4 border-b border-[#FDFBF7]/10 py-4 last:border-b-0"
                  >
                    <span className="text-xs font-semibold text-[#FBC4AB]/70">
                      0{index + 1}
                    </span>

                    <p className="text-sm leading-7 text-[#FDFBF7]/75">
                      {question}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            REMINDER
        ================================================== */}

        <section className="mt-14">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  `${emotion.color}66`,
              }}
            >
              <WellbeingIcon className="h-5 w-5 text-[#4A3F35]" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">
                {isEnglish
                  ? "A gentle reminder"
                  : "Pengingat kecil"}
              </p>

              <p className="mt-3 max-w-3xl text-[17px] leading-8 text-[#4A3F35]/70">
                {reminder}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            CTA
        ================================================== */}

        <section className="mt-16 border-t border-[#C1D5C0]/55 pt-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <DiaryIcon className="h-[17px] w-[17px] text-[#5C6B9C]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">
                  {isEnglish
                    ? "Take it into your check-in"
                    : "Bawa ke check-in"}
                </p>
              </div>

              <h2 className="mt-3 text-[25px] font-semibold tracking-[-0.03em]">
                {isEnglish
                  ? `Notice when ${name.toLowerCase()} shows up.`
                  : `Perhatikan kapan ${name.toLowerCase()} muncul.`}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#4A3F35]/50">
                {isEnglish
                  ? "Your next check-in can be a place to describe what you are experiencing in your own words."
                  : "Check-in berikutnya bisa menjadi tempat untuk menceritakan apa yang sedang kamu alami dengan kata-katamu sendiri."}
              </p>
            </div>

            <Link
              href={`/${locale}/check-in`}
              className="inline-flex h-11 items-center justify-center gap-3 bg-[#E2725B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4A3F35]"
            >
              {isEnglish
                ? "Start a check-in"
                : "Mulai check-in"}

              <ArrowRightIcon className="h-[17px] w-[17px]" />
            </Link>
          </div>
        </section>

        {/* =================================================
            BACK TO LIBRARY
        ================================================== */}

        <div className="mt-12 flex justify-center">
          <Link
            href={`/${locale}/emotions`}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-[#5C6B9C]"
          >
            <BackIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            {isEnglish
              ? "Explore other emotions"
              : "Pelajari emosi lainnya"}
          </Link>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">
        {eyebrow}
      </p>

      <h2 className="mt-2 max-w-xl text-[24px] font-semibold leading-tight tracking-[-0.03em] text-[#4A3F35] sm:text-[27px]">
        {title}
      </h2>
    </div>
  );
}