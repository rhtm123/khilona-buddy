import { error } from "@sveltejs/kit"
import { serviceApi } from "$lib/services/serviceApi.js"

export async function load({ params }) {
  try {
    const service = await serviceApi.getService(params.slug)
    console.log("service",service)

    if (!service) {
      throw error(404, "Service not found")
    }

    return {
      service,
      category: service.category,
    }
  } catch (err) {
    console.error("Error loading service:", err)
    throw error(500, "Failed to fetch service data")
  }
}
