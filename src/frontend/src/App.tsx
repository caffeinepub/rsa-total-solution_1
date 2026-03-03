import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAllPortfolioItems,
  useGetAllTestimonials,
  useSubmitInquiry,
} from "@/hooks/useQueries";
import {
  Armchair,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Hammer,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Phone,
  Sofa,
  Star,
  TreePine,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PortfolioItem, Testimonial } from "./backend.d.ts";

// ─── Constants ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    icon: Sofa,
    title: "Interior Design",
    description:
      "Bespoke interior design tailored to your lifestyle — from concept to completion, we craft spaces that breathe elegance and purpose.",
  },
  {
    icon: TreePine,
    title: "Custom Woodwork",
    description:
      "Precision-crafted wood elements using premium materials. Every grain, joint, and finish is executed with meticulous craftsmanship.",
  },
  {
    icon: Hammer,
    title: "Home Renovation",
    description:
      "Complete home transformation services — structural, aesthetic, and functional improvements that elevate your living experience.",
  },
  {
    icon: Armchair,
    title: "Bespoke Furniture",
    description:
      "One-of-a-kind furniture pieces designed specifically for your space, built to last generations with uncompromising quality.",
  },
  {
    icon: ChefHat,
    title: "Kitchen & Wardrobe Fit-outs",
    description:
      "Expertly designed kitchens and custom wardrobes that maximise storage while maintaining a refined, cohesive aesthetic.",
  },
  {
    icon: Building2,
    title: "Office Interiors",
    description:
      "Professional office environments designed to inspire productivity and impress clients — from open-plan layouts to executive suites.",
  },
];

// Category → local image mapping (front-end only, never passed through backend)
const PORTFOLIO_IMAGES: Record<string, string> = {
  Kitchen: "/assets/generated/portfolio-kitchen.dim_800x600.jpg",
  "Living Room": "/assets/generated/portfolio-livingroom.dim_800x600.jpg",
  Bedroom: "/assets/generated/portfolio-bedroom.dim_800x600.jpg",
  Furniture: "/assets/generated/portfolio-furniture.dim_800x600.jpg",
};

const FALLBACK_IMAGES = [
  "/assets/generated/portfolio-kitchen.dim_800x600.jpg",
  "/assets/generated/portfolio-livingroom.dim_800x600.jpg",
  "/assets/generated/portfolio-bedroom.dim_800x600.jpg",
  "/assets/generated/portfolio-furniture.dim_800x600.jpg",
];

// Fallback portfolio data displayed if backend has no items
const FALLBACK_PORTFOLIO: PortfolioItem[] = [
  {
    title: "Modern Oak Kitchen",
    description:
      "Sleek handleless kitchen with solid oak cabinetry and stone worktops.",
    imageUrl: "/assets/generated/portfolio-kitchen.dim_800x600.jpg",
    category: "Kitchen",
  },
  {
    title: "Luxury Living Room",
    description:
      "Open-plan living space with bespoke shelving and warm ambient lighting.",
    imageUrl: "/assets/generated/portfolio-livingroom.dim_800x600.jpg",
    category: "Living Room",
  },
  {
    title: "Serene Master Bedroom",
    description:
      "Minimalist master suite with built-in walnut cabinetry and linen walls.",
    imageUrl: "/assets/generated/portfolio-bedroom.dim_800x600.jpg",
    category: "Bedroom",
  },
  {
    title: "Walnut Dining Table",
    description:
      "Handcrafted solid walnut dining table with dovetail joinery, seats twelve.",
    imageUrl: "/assets/generated/portfolio-furniture.dim_800x600.jpg",
    category: "Furniture",
  },
  {
    title: "Marble Island Kitchen",
    description:
      "Chef's kitchen with Calacatta marble island and custom brass hardware.",
    imageUrl: "/assets/generated/portfolio-kitchen.dim_800x600.jpg",
    category: "Kitchen",
  },
  {
    title: "Reading Nook & Library",
    description:
      "Floor-to-ceiling bespoke bookcase with integrated ladder and reading alcove.",
    imageUrl: "/assets/generated/portfolio-livingroom.dim_800x600.jpg",
    category: "Living Room",
  },
];

// Fallback testimonials
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    review:
      "RSA Total Solution transformed our home beyond our imagination. The attention to detail in the woodwork is extraordinary — every joint, every finish speaks of true craftsmanship.",
    clientName: "Amara Okonkwo",
    role: "Homeowner, Lagos",
    rating: BigInt(5),
  },
  {
    review:
      "From concept to completion, the team delivered flawlessly. Our office now reflects the prestige of our brand. Clients notice immediately — we've received countless compliments.",
    clientName: "David Mensah",
    role: "Managing Director, Accra",
    rating: BigInt(5),
  },
  {
    review:
      "The bespoke kitchen they designed for us is the heart of our home. Functional, stunning, and crafted to perfection. Worth every penny and more.",
    clientName: "Nneka Adeyemi",
    role: "Restaurant Owner, Abuja",
    rating: BigInt(5),
  },
  {
    review:
      "Professional, creative, and deeply committed to quality. The wardrobe fit-out exceeded our expectations in every way. We've already referred three friends.",
    clientName: "James Owusu",
    role: "Architect, Kumasi",
    rating: BigInt(4),
  },
];

// ─── Utility ────────────────────────────────────────────────────────────────

function getPortfolioImage(item: PortfolioItem, index: number): string {
  return (
    PORTFOLIO_IMAGES[item.category] ??
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-charcoal/95 backdrop-blur-md border-b border-border shadow-luxury"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between h-18 py-4">
        {/* Logo */}
        <button
          type="button"
          className="flex items-center gap-3 group"
          data-ocid="nav.link"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="w-8 h-8 border border-primary/60 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500">
            <div className="w-3 h-3 bg-primary rotate-0" />
          </div>
          <span className="font-serif text-lg font-bold text-foreground leading-tight">
            RSA<span className="text-primary"> Total</span>
            <br />
            <span className="text-xs tracking-[0.15em] uppercase font-sans font-medium text-muted-foreground">
              Solution
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-ocid="nav.link"
                className="text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors duration-200 relative group"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          className="hidden md:flex bg-primary text-primary-foreground hover:bg-gold-light border-0 text-sm tracking-wide"
          data-ocid="nav.primary_button"
          onClick={() => handleNavClick("#contact")}
        >
          Get a Quote
        </Button>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden text-foreground p-2"
          data-ocid="nav.toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-charcoal/98 backdrop-blur-lg border-b border-border overflow-hidden"
          >
            <ul className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-ocid="nav.link"
                    className="block text-base text-foreground hover:text-primary transition-colors py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Button
                  className="w-full bg-primary text-primary-foreground"
                  data-ocid="nav.primary_button"
                  onClick={() => handleNavClick("#contact")}
                >
                  Get a Quote
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-interior.dim_1920x1080.jpg"
          alt="Luxury interior"
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/60 to-charcoal/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-charcoal/20" />
      </div>

      {/* Decorative gold lines */}
      <div className="absolute top-1/2 left-0 w-24 h-px bg-primary/40 hidden lg:block" />
      <div className="absolute top-1/2 right-0 w-24 h-px bg-primary/40 hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <span className="label-text">Est. 2010 · Premium Interiors</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-cream leading-[1.05] mb-6"
        >
          Crafting Spaces
          <br />
          <em className="text-primary not-italic">That Inspire.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-foreground/70 max-w-xl mx-auto mb-10 font-sans leading-relaxed"
        >
          Premium interior design and bespoke woodwork solutions — where vision
          meets master craftsmanship.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-gold-light border-0 px-8 py-6 text-base tracking-wide font-medium shadow-gold-glow"
            data-ocid="hero.primary_button"
            onClick={() => handleScroll("#portfolio")}
          >
            View Our Work
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary px-8 py-6 text-base tracking-wide"
            data-ocid="hero.secondary_button"
            onClick={() => handleScroll("#contact")}
          >
            Get a Quote
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase text-muted-foreground">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.8,
            ease: "easeInOut",
          }}
        >
          <ChevronDown size={18} className="text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" className="section-padding bg-charcoal-mid">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="label-text mb-4">Our Story</p>
            <div className="gold-divider" />
            <h2 className="section-heading mb-8">Who We Are</h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                RSA Total Solution is a premier interior design and bespoke
                woodwork studio with over a decade of experience transforming
                residential and commercial spaces across West Africa. Founded on
                a belief that great design is both art and science, we bring
                together creative vision and technical excellence in every
                project we undertake.
              </p>
              <p>
                Our team of skilled designers and master craftsmen works closely
                with each client to understand their unique needs, preferences,
                and lifestyle. From the first consultation to the final reveal,
                we maintain an unwavering commitment to quality, precision, and
                the kind of attention to detail that turns houses into homes.
              </p>
              <p>
                Whether you're reimagining a single room or transforming an
                entire property, RSA Total Solution delivers spaces that are not
                just beautiful — they're built to endure. Our custom woodwork,
                in particular, is created using sustainably sourced premium
                timbers, finished by hand to a standard rarely found in modern
                construction.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {[
                { num: "200+", label: "Projects Completed" },
                { num: "12+", label: "Years Experience" },
                { num: "100%", label: "Client Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl font-bold text-primary mb-1">
                    {stat.num}
                  </p>
                  <p className="text-xs text-muted-foreground tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: image panel with gold frame */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden md:block"
          >
            {/* Offset gold frame — drawn behind the photo */}
            <div
              className="absolute inset-0 border border-primary/40 rounded-sm"
              style={{ transform: "translate(16px, 16px)" }}
            />

            {/* Main photo */}
            <div className="relative h-[520px] rounded-sm overflow-hidden shadow-luxury">
              <img
                src="/assets/generated/hero-interior.dim_1920x1080.jpg"
                alt="RSA Total Solution craftsmanship"
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: "60% center" }}
              />
              {/* Warm vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/70 via-transparent to-transparent" />

              {/* Corner gold accent marks */}
              <div className="absolute top-5 left-5 w-10 h-10 border-l-2 border-t-2 border-primary/80" />
              <div className="absolute bottom-5 right-5 w-10 h-10 border-r-2 border-b-2 border-primary/80" />

              {/* Brand watermark over image */}
              <div className="absolute bottom-6 left-6">
                <p className="font-serif text-lg font-bold text-cream/90 leading-none">
                  RSA
                </p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-primary mt-0.5">
                  Total Solution
                </p>
              </div>
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-6 bg-charcoal border border-primary/40 p-5 shadow-luxury w-44 z-10">
              <p className="font-serif text-4xl font-bold text-primary leading-none">
                15+
              </p>
              <p className="text-xs text-muted-foreground mt-2 tracking-wide leading-snug">
                Industry Awards
                <br />
                Won
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Services ────────────────────────────────────────────────────────────────

function Services() {
  return (
    <section id="services" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="label-text mb-4">What We Do</p>
          <div className="gold-divider-center" />
          <h2 className="section-heading max-w-2xl mx-auto">Our Services</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            From concept to completion, we offer a full spectrum of interior and
            woodwork services crafted to the highest standard.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-ocid={`services.card.${i + 1}`}
              className="group relative bg-card border border-border p-8 rounded-sm card-hover cursor-default"
            >
              {/* Hover gold line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />

              <div className="w-12 h-12 border border-primary/30 flex items-center justify-center mb-6 group-hover:border-primary/70 transition-colors duration-300">
                <service.icon size={22} className="text-primary" />
              </div>

              <h3 className="font-serif text-xl font-bold text-card-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

function Portfolio() {
  const { data: backendItems, isLoading } = useGetAllPortfolioItems();
  const [activeCategory, setActiveCategory] = useState("All");

  const items =
    backendItems && backendItems.length > 0 ? backendItems : FALLBACK_PORTFOLIO;

  const categories = [
    "All",
    ...Array.from(new Set(items.map((item) => item.category))),
  ];

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <section id="portfolio" className="section-padding bg-charcoal-mid">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="label-text mb-4">Our Work</p>
          <div className="gold-divider-center" />
          <h2 className="section-heading max-w-2xl mx-auto">Portfolio</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            A curated selection of our finest projects — each one a testament to
            our craft.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex justify-center mb-10">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            data-ocid="portfolio.tab"
          >
            <TabsList className="bg-charcoal border border-border flex-wrap h-auto gap-1 p-1">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  data-ocid="portfolio.tab"
                  className="text-xs tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div
            className="flex items-center justify-center py-20 text-muted-foreground"
            data-ocid="portfolio.loading_state"
          >
            <Loader2 className="animate-spin mr-3 h-5 w-5 text-primary" />
            Loading portfolio…
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={`${item.category}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  data-ocid={`portfolio.item.${i + 1}`}
                  className="portfolio-card group relative overflow-hidden rounded-sm bg-card border border-border"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getPortfolioImage(item, i)}
                      alt={item.title}
                      className="portfolio-img w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6">
                    <p className="font-serif text-lg font-bold text-cream mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground text-xs tracking-wide border-0">
                      {item.category}
                    </Badge>
                  </div>

                  {/* Bottom static info */}
                  <div className="p-5 group-hover:opacity-0 transition-opacity duration-300">
                    <p className="font-serif font-semibold text-card-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="portfolio.empty_state"
          >
            No projects found in this category.
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: bigint }) {
  const n = Number(rating);
  return (
    <div className="flex gap-1">
      {(["s1", "s2", "s3", "s4", "s5"] as const).map((key, i) => (
        <Star
          key={key}
          size={14}
          className={
            i < n ? "fill-primary text-primary" : "text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function Testimonials() {
  const { data: backendTestimonials, isLoading } = useGetAllTestimonials();
  const testimonials =
    backendTestimonials && backendTestimonials.length > 0
      ? backendTestimonials
      : FALLBACK_TESTIMONIALS;

  return (
    <section id="testimonials" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="label-text mb-4">Client Stories</p>
          <div className="gold-divider-center" />
          <h2 className="section-heading">What Our Clients Say</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Real words from the people who matter most — our clients.
          </p>
        </motion.div>

        {isLoading && (
          <div
            className="flex items-center justify-center py-16 text-muted-foreground"
            data-ocid="testimonials.loading_state"
          >
            <Loader2 className="animate-spin mr-3 h-5 w-5 text-primary" />
            Loading testimonials…
          </div>
        )}

        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={`${t.clientName}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-ocid={`testimonials.item.${i + 1}`}
                className="relative group rounded-sm p-7 overflow-hidden card-hover"
                style={{
                  background:
                    "linear-gradient(145deg, oklch(0.19 0.014 62) 0%, oklch(0.16 0.01 55) 100%)",
                  border: "1px solid oklch(0.32 0.025 62 / 0.6)",
                }}
              >
                {/* Large decorative opening quote */}
                <div
                  className="absolute -top-3 right-5 font-serif leading-none select-none pointer-events-none"
                  style={{
                    fontSize: "8rem",
                    color: "oklch(0.72 0.12 68 / 0.18)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;
                </div>

                {/* Gold left accent */}
                <div className="absolute top-0 left-0 w-0.5 h-12 bg-gradient-to-b from-primary to-transparent" />

                <StarRating rating={t.rating} />

                <p
                  className="text-foreground/80 leading-relaxed mt-5 mb-7 font-serif"
                  style={{
                    fontSize: "0.9375rem",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  &ldquo;{t.review}&rdquo;
                </p>

                <div
                  className="flex items-center gap-3 pt-5 border-t"
                  style={{ borderColor: "oklch(0.32 0.025 62 / 0.5)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.72 0.12 68 / 0.25), oklch(0.72 0.12 68 / 0.1))",
                      border: "1px solid oklch(0.72 0.12 68 / 0.4)",
                    }}
                  >
                    <span className="text-sm font-bold text-primary font-serif">
                      {t.clientName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && testimonials.length === 0 && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="testimonials.empty_state"
          >
            No testimonials yet. Be the first to share your experience.
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function Contact() {
  const { mutate: submitInquiry, isPending } = useSubmitInquiry();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitInquiry(
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setForm({ name: "", email: "", phone: "", message: "" });
          toast.success(
            "Your inquiry has been sent. We'll be in touch shortly.",
          );
        },
        onError: () => {
          toast.error("Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <section id="contact" className="section-padding bg-charcoal-mid">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="label-text mb-4">Let's Talk</p>
          <div className="gold-divider-center" />
          <h2 className="section-heading">Get In Touch</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Ready to transform your space? Share your vision with us and we'll
            craft a proposal tailored to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl mx-auto">
          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
              Contact Details
            </h3>
            <div className="space-y-5">
              {[
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+234 800 123 4567",
                  href: "tel:+2348001234567",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "hello@rsatotalsolution.com",
                  href: "mailto:hello@rsatotalsolution.com",
                },
                {
                  icon: MapPin,
                  label: "Address",
                  value: "14 Victoria Island Boulevard, Lagos, Nigeria",
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-foreground hover:text-primary transition-colors text-sm"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-foreground text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Opening hours */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-xs tracking-[0.15em] uppercase text-primary mb-4">
                Working Hours
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="text-foreground">8:00am – 6:00pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-foreground">9:00am – 3:00pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted-foreground/50">Closed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-card border border-primary/30 rounded-sm p-10 text-center"
                  data-ocid="contact.success_state"
                >
                  <div className="w-16 h-16 border border-primary/40 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={28} className="text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                    Message Received
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Thank you for reaching out. Our team will review your
                    inquiry and respond within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10"
                    onClick={() => setSubmitted(false)}
                    data-ocid="contact.secondary_button"
                  >
                    Send Another Inquiry
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                  data-ocid="contact.modal"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-xs tracking-wide text-muted-foreground uppercase"
                      >
                        Full Name <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Mensah"
                        required
                        data-ocid="contact.input"
                        className="bg-charcoal border-border focus:border-primary/60 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-xs tracking-wide text-muted-foreground uppercase"
                      >
                        Email <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        data-ocid="contact.input"
                        className="bg-charcoal border-border focus:border-primary/60 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-xs tracking-wide text-muted-foreground uppercase"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+234 800 000 0000"
                      data-ocid="contact.input"
                      className="bg-charcoal border-border focus:border-primary/60 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-xs tracking-wide text-muted-foreground uppercase"
                    >
                      Message <span className="text-primary">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project — space type, size, style preferences, and timeline…"
                      required
                      rows={5}
                      data-ocid="contact.textarea"
                      className="bg-charcoal border-border focus:border-primary/60 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="w-full bg-primary text-primary-foreground hover:bg-gold-light border-0 py-6 tracking-wide"
                    data-ocid="contact.submit_button"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-charcoal border-t border-border">
      <div className="container mx-auto px-6 py-14">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 border border-primary/50 flex items-center justify-center rotate-45">
                <div className="w-2.5 h-2.5 bg-primary rotate-0" />
              </div>
              <span className="font-serif text-base font-bold text-foreground">
                RSA Total Solution
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium interior design and bespoke woodwork — transforming spaces
              into masterpieces since 2010.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-5">
              Quick Links
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-ocid="nav.link"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact mini */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-5">
              Contact
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>+234 800 123 4567</p>
              <p>hello@rsatotalsolution.com</p>
              <p>14 Victoria Island Boulevard, Lagos</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {year} RSA Total Solution. All rights reserved.</p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
