const { ApifyClient } = require('apify-client');

// Initialize Apify
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

/**
 * Service to discover nearby civic services or businesses related to a category
 * Uses Apify Google Maps Scraper or similar actors.
 * Results are cached in the DB via the ServiceProvider model.
 */
const discoverNearbyServices = async (category, lat, lng, ServiceProviderModel) => {
  try {
    // 1. Check cache first
    const cached = await ServiceProviderModel.find({
      category,
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 5000 // 5km
        }
      }
    }).limit(5);

    if (cached.length > 0) {
      return cached;
    }

    // 2. If not cached, call Apify (Using Google Maps Scraper logic)
    // Note: In a real prod environment, this would be a long running task.
    // Here we simulate the search query.
    const searchQuery = `${category} services near ${lat}, ${lng}`;
    console.log(`Calling Apify for: ${searchQuery}`);

    // This is a placeholder for the actual Apify actor execution.
    // For the demo, we simulate a successful call with relevant data.
    const mockResults = [
      {
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Repair Center`,
        phone: '+91 98765 43210',
        address: 'Main Road, Sector 4, Civic Center',
        rating: 4.2,
        location: { type: 'Point', coordinates: [lng + 0.01, lat + 0.01] }
      },
      {
        name: `City ${category.charAt(0).toUpperCase() + category.slice(1)} Solutions`,
        phone: '+91 87654 32109',
        address: 'Market Yard, Industrial Area',
        rating: 3.8,
        location: { type: 'Point', coordinates: [lng - 0.005, lat + 0.012] }
      }
    ];

    // 3. Save to cache
    const savedProviders = [];
    for (const res of mockResults) {
      const provider = await ServiceProviderModel.create({
        ...res,
        category,
        lastSynced: new Date()
      });
      savedProviders.push(provider);
    }

    return savedProviders;
  } catch (error) {
    console.error("Apify Discovery Error:", error);
    return [];
  }
};

module.exports = { discoverNearbyServices };
