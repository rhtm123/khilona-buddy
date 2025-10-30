// Enhanced sample data for services
export const servicesData = {
    categories: [
      {
        id: 1,
        name: "Home Cleaning",
        slug: "home-cleaning",
        description: "Professional cleaning services for your home",
        icon: "mdi:broom",
        image: "/placeholder.svg?height=300&width=400",
        color: "from-blue-500 to-cyan-500",
        subcategories: [
          {
            id: 101,
            name: "Deep Cleaning",
            slug: "deep-cleaning",
            description: "Thorough cleaning of your entire home",
            icon: "mdi:spray-bottle",
            services: [
              {
                id: 1001,
                name: "Premium Deep Cleaning",
                slug: "premium-deep-cleaning",
                description: "Complete deep cleaning with premium products and extra attention to detail",
                longDescription:
                  "Our premium deep cleaning service includes comprehensive cleaning of all rooms, kitchen deep clean, bathroom sanitization, window cleaning, and furniture polishing. We use eco-friendly products and professional equipment.",
                duration: "5-6 hours",
                price: 149.99,
                originalPrice: 199.99,
                rating: 4.9,
                reviewCount: 245,
                image: "/placeholder.svg?height=400&width=600",
                gallery: [
                  "/placeholder.svg?height=300&width=400",
                  "/placeholder.svg?height=300&width=400",
                  "/placeholder.svg?height=300&width=400",
                ],
                features: [
                  "All rooms deep cleaning",
                  "Kitchen appliance cleaning",
                  "Bathroom sanitization",
                  "Window cleaning (interior)",
                  "Furniture polishing",
                  "Eco-friendly products",
                ],
                provider: {
                  name: "CleanPro Services",
                  rating: 4.8,
                  experience: "5+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available today",
                tags: ["Premium", "Eco-friendly", "Insured"],
                category: "Home Cleaning",
                subcategory: "Deep Cleaning",
              },
              {
                id: 1002,
                name: "Standard Deep Cleaning",
                slug: "standard-deep-cleaning",
                description: "Thorough cleaning of all rooms and surfaces",
                longDescription:
                  "Our standard deep cleaning covers all essential areas of your home with professional cleaning techniques and quality products.",
                duration: "4-5 hours",
                price: 99.99,
                originalPrice: 129.99,
                rating: 4.7,
                reviewCount: 189,
                image: "/placeholder.svg?height=400&width=600",
                gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
                features: [
                  "All rooms cleaning",
                  "Kitchen cleaning",
                  "Bathroom cleaning",
                  "Dusting and vacuuming",
                  "Floor mopping",
                ],
                provider: {
                  name: "CleanPro Services",
                  rating: 4.8,
                  experience: "5+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available today",
                tags: ["Standard", "Reliable"],
                category: "Home Cleaning",
                subcategory: "Deep Cleaning",
              },
            ],
          },
          {
            id: 102,
            name: "Regular Cleaning",
            slug: "regular-cleaning",
            description: "Scheduled cleaning services for maintenance",
            icon: "mdi:calendar-clock",
            services: [
              {
                id: 1003,
                name: "Weekly Cleaning",
                slug: "weekly-cleaning",
                description: "Regular weekly cleaning service to maintain your home",
                longDescription:
                  "Keep your home consistently clean with our weekly cleaning service. Perfect for busy families and professionals.",
                duration: "2-3 hours",
                price: 59.99,
                originalPrice: 79.99,
                rating: 4.8,
                reviewCount: 312,
                image: "/placeholder.svg?height=400&width=600",
                gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
                features: [
                  "Weekly schedule",
                  "Basic room cleaning",
                  "Kitchen maintenance",
                  "Bathroom cleaning",
                  "Trash removal",
                ],
                provider: {
                  name: "CleanPro Services",
                  rating: 4.8,
                  experience: "5+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available this week",
                tags: ["Weekly", "Maintenance"],
                category: "Home Cleaning",
                subcategory: "Regular Cleaning",
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "Men's Grooming",
        slug: "mens-grooming",
        description: "Professional grooming services for men",
        icon: "mdi:content-cut",
        image: "/placeholder.svg?height=300&width=400",
        color: "from-purple-500 to-pink-500",
        subcategories: [
          {
            id: 201,
            name: "Haircut",
            slug: "haircut",
            description: "Professional haircuts by expert stylists",
            icon: "mdi:hair-dryer",
            services: [
              {
                id: 2001,
                name: "Luxury Haircut Package",
                slug: "luxury-haircut-package",
                description: "Premium haircut with head massage, styling, and grooming consultation",
                longDescription:
                  "Experience the ultimate in men's grooming with our luxury package including consultation, premium haircut, head massage, styling, and aftercare advice.",
                duration: "45-60 mins",
                price: 49.99,
                originalPrice: 69.99,
                rating: 4.9,
                reviewCount: 423,
                image: "/placeholder.svg?height=400&width=600",
                gallery: [
                  "/placeholder.svg?height=300&width=400",
                  "/placeholder.svg?height=300&width=400",
                  "/placeholder.svg?height=300&width=400",
                ],
                features: [
                  "Style consultation",
                  "Premium haircut",
                  "Head massage",
                  "Hair styling",
                  "Aftercare advice",
                  "Premium products",
                ],
                provider: {
                  name: "StyleMaster Salon",
                  rating: 4.9,
                  experience: "8+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available today",
                tags: ["Luxury", "Premium", "Consultation"],
                category: "Men's Grooming",
                subcategory: "Haircut",
              },
              {
                id: 2002,
                name: "Standard Haircut",
                slug: "standard-haircut",
                description: "Classic haircut with washing and styling",
                longDescription:
                  "Professional haircut service with hair wash, cut, and basic styling to keep you looking sharp.",
                duration: "30 mins",
                price: 29.99,
                originalPrice: 39.99,
                rating: 4.7,
                reviewCount: 356,
                image: "/placeholder.svg?height=400&width=600",
                gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
                features: ["Hair wash", "Professional cut", "Basic styling", "Quality products"],
                provider: {
                  name: "StyleMaster Salon",
                  rating: 4.9,
                  experience: "8+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available today",
                tags: ["Standard", "Quick"],
                category: "Men's Grooming",
                subcategory: "Haircut",
              },
            ],
          },
        ],
      },
      {
        id: 3,
        name: "Home Repairs",
        slug: "home-repairs",
        description: "Professional repair services for your home",
        icon: "mdi:tools",
        image: "/placeholder.svg?height=300&width=400",
        color: "from-orange-500 to-red-500",
        subcategories: [
          {
            id: 301,
            name: "Plumbing",
            slug: "plumbing",
            description: "Professional plumbing repair services",
            icon: "mdi:pipe",
            services: [
              {
                id: 3001,
                name: "Emergency Plumbing",
                slug: "emergency-plumbing",
                description: "24/7 emergency plumbing service for urgent issues",
                longDescription:
                  "Round-the-clock emergency plumbing service for leaks, blockages, and urgent repairs. Our certified plumbers are available 24/7.",
                duration: "Varies",
                price: 89.99,
                originalPrice: 119.99,
                rating: 4.8,
                reviewCount: 198,
                image: "/placeholder.svg?height=400&width=600",
                gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
                features: [
                  "24/7 availability",
                  "Emergency response",
                  "Certified plumbers",
                  "All tools included",
                  "Warranty included",
                ],
                provider: {
                  name: "FixIt Pro",
                  rating: 4.7,
                  experience: "10+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available 24/7",
                tags: ["Emergency", "24/7", "Certified"],
                category: "Home Repairs",
                subcategory: "Plumbing",
              },
            ],
          },
        ],
      },
      {
        id: 4,
        name: "Pet Care",
        slug: "pet-care",
        description: "Professional care services for your pets",
        icon: "mdi:paw",
        image: "/placeholder.svg?height=300&width=400",
        color: "from-green-500 to-teal-500",
        subcategories: [
          {
            id: 401,
            name: "Dog Grooming",
            slug: "dog-grooming",
            description: "Professional grooming services for dogs",
            icon: "mdi:dog",
            services: [
              {
                id: 4001,
                name: "Full Dog Grooming",
                slug: "full-dog-grooming",
                description: "Complete grooming package including bath, haircut, nail trimming, and ear cleaning",
                longDescription:
                  "Comprehensive grooming service for your furry friend including bath, haircut, nail trimming, ear cleaning, and health check.",
                duration: "1-2 hours",
                price: 59.99,
                originalPrice: 79.99,
                rating: 4.9,
                reviewCount: 287,
                image: "/placeholder.svg?height=400&width=600",
                gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
                features: [
                  "Full bath & dry",
                  "Professional haircut",
                  "Nail trimming",
                  "Ear cleaning",
                  "Health check",
                  "Pet-safe products",
                ],
                provider: {
                  name: "PetCare Plus",
                  rating: 4.8,
                  experience: "6+ years",
                  verified: true,
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                availability: "Available this week",
                tags: ["Complete", "Health Check", "Pet-Safe"],
                category: "Pet Care",
                subcategory: "Dog Grooming",
              },
            ],
          },
        ],
      },
    ],
  }
  
  // Helper function to find a category by slug
  export function getCategoryBySlug(slug) {
    return servicesData.categories.find((category) => category.slug === slug)
  }
  
  // Helper function to find a subcategory by slug within a category
  export function getSubcategoryBySlug(categorySlug, subcategorySlug) {
    const category = getCategoryBySlug(categorySlug)
    if (!category) return null
    return category.subcategories.find((sub) => sub.slug === subcategorySlug)
  }
  
  // Helper function to find a service by ID
  export function getServiceById(serviceId) {
    for (const category of servicesData.categories) {
      for (const subcategory of category.subcategories) {
        const service = subcategory.services.find((s) => s.id === Number.parseInt(serviceId))
        if (service) return service
      }
    }
    return null
  }
  
  // Helper function to get all services
  export function getAllServices() {
    return servicesData.categories.flatMap((cat) => cat.subcategories.flatMap((sub) => sub.services || []))
  }
  