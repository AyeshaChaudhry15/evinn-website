export interface BlogPost {
  slug: string;
  tag: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  content: string[];
}

export const posts: BlogPost[] = [
  {
    slug: "rise-of-electric-bikes-in-pakistan",
    tag: "Industry News",
    title: "The Rise of Electric Bikes in Pakistan",
    date: "20 Aug 2024",
    image: "/blog1.avif",
    excerpt: "Electric bikes are quickly becoming the go-to choice for commuters across Pakistan.",
    content: [
      "Electric bikes are gaining massive popularity across Pakistan's major cities due to rising fuel prices and growing environmental awareness.",
      "Local manufacturers are now offering affordable models with better range and charging infrastructure, making the switch easier for everyday riders.",
      "Government incentives and reduced import duties are also expected to accelerate adoption over the next few years.",
    ],
  },
  {
    slug: "how-to-choose-electric-scooter",
    tag: "Buying Guide",
    title: "How to Choose the Right Electric Scooter",
    date: "18 Aug 2024",
    image: "/blog2.webp",
    excerpt: "A practical guide to picking an electric scooter that fits your daily commute.",
    content: [
      "Choosing the right electric scooter depends on your daily commute distance, terrain, and budget.",
      "Battery capacity, motor power, and build quality are the three most important factors to compare before buying.",
      "Always check for after-sales service and warranty coverage in your city before finalizing a model.",
    ],
  },
  {
    slug: "future-of-green-mobility-2025",
    tag: "Technology",
    title: "Future of Green Mobility in 2025",
    date: "15 Aug 2024",
    image: "/blog3.avif",
    excerpt: "What's next for electric vehicles and sustainable transport in the coming year.",
    content: [
      "2025 is shaping up to be a landmark year for green mobility, with faster charging tech and smarter battery management systems.",
      "Cities are investing in EV-friendly infrastructure, from charging stations to dedicated lanes for electric two-wheelers.",
      "Expect more affordable EV models entering the market as competition among local and international brands increases.",
    ],
  },
  {
    slug: "why-evs-are-smarter-choice",
    tag: "Sustainability",
    title: "Why EVs Are a Smarter Choice",
    date: "12 Aug 2024",
    image: "/blog4.avif",
    excerpt: "Comparing long-term costs and environmental impact of EVs versus petrol vehicles.",
    content: [
      "Electric vehicles offer significantly lower running costs compared to petrol-powered alternatives, especially amid fluctuating fuel prices.",
      "Maintenance is simpler too, since EVs have fewer moving parts and no need for regular oil changes.",
      "From an environmental standpoint, EVs produce zero tailpipe emissions, making them a cleaner choice for urban areas.",
    ],
  },
  {
    slug: "ev-charging-infrastructure-growth",
    tag: "Industry News",
    title: "EV Charging Infrastructure Growth",
    date: "10 Aug 2024",
    image: "/blog5.jpg",
    excerpt: "Charging networks are expanding fast — here's what it means for EV owners.",
    content: [
      "Charging infrastructure is expanding rapidly across major highways and urban centers.",
      "Private companies and government bodies are partnering to install fast-charging stations in high-traffic areas.",
      "This growth is expected to remove one of the biggest barriers to EV adoption: range anxiety.",
    ],
  },
  {
    slug: "battery-life-what-you-need-to-know",
    tag: "Buying Guide",
    title: "Battery Life: What You Need to Know",
    date: "8 Aug 2024",
    image: "/blog6.jpg",
    excerpt: "Everything you should know about EV battery lifespan and care.",
    content: [
      "Battery life is one of the most common concerns for new EV buyers, and rightly so.",
      "Most modern lithium-ion batteries are rated for several years of daily use before any noticeable capacity loss.",
      "Simple habits like avoiding full discharge and extreme heat exposure can significantly extend battery lifespan.",
    ],
  },
  {
    slug: "smart-features-in-modern-evs",
    tag: "Technology",
    title: "Smart Features in Modern EVs",
    date: "5 Aug 2024",
    image: "/blog7.avif",
    excerpt: "From app connectivity to GPS tracking, EVs are getting smarter every year.",
    content: [
      "Modern electric vehicles now come equipped with smart features like app-based connectivity and real-time diagnostics.",
      "GPS tracking, geofencing, and remote battery monitoring are becoming standard even in budget-friendly models.",
      "These features not only improve convenience but also add a layer of security against theft.",
    ],
  },
  {
    slug: "reducing-carbon-footprint-with-evs",
    tag: "Sustainability",
    title: "Reducing Carbon Footprint with EVs",
    date: "2 Aug 2024",
    image: "/blog8.avif",
    excerpt: "How switching to electric can meaningfully cut your personal carbon footprint.",
    content: [
      "Switching to an electric vehicle is one of the most impactful personal choices for reducing your carbon footprint.",
      "Even when accounting for electricity generation, EVs typically produce fewer lifetime emissions than petrol vehicles.",
      "As the power grid shifts toward renewable sources, this gap will only continue to widen in favor of EVs.",
    ],
  },
];