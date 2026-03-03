import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  // --- Data Types ---
  type Category = Text;

  type Inquiry = {
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
    timestamp : Time.Time;
  };

  module Inquiry {
    public func compareByTime(a : Inquiry, b : Inquiry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  type PortfolioItem = {
    title : Text;
    description : Text;
    category : Category;
    imageUrl : Text;
  };

  type Testimonial = {
    clientName : Text;
    role : Text;
    review : Text;
    rating : Nat;
  };

  // --- Storage ---
  let inquiriesMap = Map.empty<Time.Time, Inquiry>();
  let portfolioMap = Map.empty<Text, PortfolioItem>();
  let testimonialsMap = Map.empty<Text, Testimonial>();

  // Portfolio pre-seed
  let preSeedPortfolio = [
    {
      title = "Modern Living Room Interior";
      description = "Complete living room renovation with custom furniture and lighting design.";
      category = "Interior Design";
      imageUrl = "https://example.com/livingroom.jpg";
    },
    {
      title = "Custom Oak Kitchen Cabinets";
      description = "Handcrafted kitchen cabinetry with integrated storage solutions.";
      category = "Custom Woodwork";
      imageUrl = "https://example.com/kitchencabinets.jpg";
    },
    {
      title = "Office Space Renovation";
      description = "Commercial office redesign featuring ergonomic workstations and open collaboration spaces.";
      category = "Renovation";
      imageUrl = "https://example.com/officespace.jpg";
    },
    {
      title = "Solid Walnut Dining Table";
      description = "Bespoke six-seater dining table made from premium walnut wood.";
      category = "Furniture";
      imageUrl = "https://example.com/diningtable.jpg";
    },
  ];

  // Testimonial pre-seed
  let preSeedTestimonials = [
    {
      clientName = "Sarah Johnson";
      role = "Home Owner";
      review = "RSA Total Solution exceeded my expectations with their attention to detail and outstanding craftsmanship.";
      rating = 5;
    },
    {
      clientName = "Michael Lee";
      role = "Restaurant Owner";
      review = "The team transformed our restaurant space, bringing our vision to life. Highly recommended!";
      rating = 5;
    },
    {
      clientName = "Emily Chen";
      role = "Interior Designer";
      review = "Working with RSA Total Solution was a seamless experience. Their expertise in custom woodwork is unmatched.";
      rating = 4;
    },
  ];

  // Add portfolio for pre-seed durability
  for (p in preSeedPortfolio.values()) {
    portfolioMap.add(p.title, p);
  };

  // Add testimonials for pre-seed durability
  for (t in preSeedTestimonials.values()) {
    testimonialsMap.add(t.clientName, t);
  };

  // --- Functions ---

  // Contact Form Submission
  public shared ({ caller }) func submitInquiry(name : Text, email : Text, phone : Text, message : Text) : async () {
    if (name == "" or email == "" or message == "") {
      Runtime.trap("Name, email, and message fields are required");
    };

    let timestamp = Time.now();

    let inquiry : Inquiry = {
      name;
      email;
      phone;
      message;
      timestamp;
    };

    inquiriesMap.add(timestamp, inquiry);
  };

  // Get all contact inquiries (admin use)
  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    let iter = inquiriesMap.values();
    iter.toArray().sort(Inquiry.compareByTime);
  };

  // Get all portfolio items
  public query ({ caller }) func getAllPortfolioItems() : async [PortfolioItem] {
    portfolioMap.values().toArray();
  };

  // Get portfolio items by category
  public query ({ caller }) func getPortfolioByCategory(category : Category) : async [PortfolioItem] {
    portfolioMap.values().toArray().filter(
      func(item) { item.category == category }
    );
  };

  // Add new portfolio item (admin use)
  public shared ({ caller }) func addPortfolioItem(title : Text, description : Text, category : Category, imageUrl : Text) : async () {
    // Validate input
    if (title == "" or description == "" or category == "" or imageUrl == "") {
      Runtime.trap("All fields are required");
    };

    let newItem : PortfolioItem = {
      title;
      description;
      category;
      imageUrl;
    };

    portfolioMap.add(title, newItem);
  };

  // Add testimonial (admin use)
  public shared ({ caller }) func addTestimonial(clientName : Text, role : Text, review : Text, rating : Nat) : async () {
    if (clientName == "" or review == "" or rating < 1 or rating > 5) {
      Runtime.trap("Valid client name, review, and rating (1-5) are required");
    };

    let testimonial : Testimonial = {
      clientName;
      role;
      review;
      rating;
    };

    testimonialsMap.add(clientName, testimonial);
  };

  // Get all testimonials
  public query ({ caller }) func getAllTestimonials() : async [Testimonial] {
    testimonialsMap.values().toArray();
  };
};
