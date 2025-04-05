import ZohoServiceImpl from "./api/zohoService";
import BasecampServiceImpl from "./api/basecampService";

// Create singleton instances
const zohoService = new ZohoServiceImpl();
const basecampService = new BasecampServiceImpl();

// Export the instances
export { zohoService, basecampService };
