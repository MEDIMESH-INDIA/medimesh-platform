import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')

    if (!apiKey) {
      throw new Error('Google Places API key is not configured.')
    }

    const searchQuery = query || "hospitals in Navi Mumbai, Maharashtra, India"

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.businessStatus'
      },
      body: JSON.stringify({
        textQuery: searchQuery,
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Google API responded with ${response.status}: ${err}`)
    }

    const data = await response.json()

    // Transform to MEDIMESH shape
    const formatted = (data.places || []).map((place: any) => ({
      id: place.id,
      slug: `google-${place.id}`,
      name: place.displayName?.text,
      location: place.formattedAddress,
      type: place.types?.[0]?.replace(/_/g, ' ') || 'Hospital',
      specialties: place.types || [],
      facilities: [], // Can't derive facilities accurately from Places textSearch alone
      trustMetadata: {
        sourceLabel: "Google Places",
        source: "Google Places API",
        reviewState: "Unverified live data",
        lastChecked: new Date().toISOString().split('T')[0],
        dataScope: "Live discovery only. Not in MEDIMESH database.",
        dataStatus: "External source"
      },
      businessStatus: place.businessStatus,
      isLiveGoogleResult: true
    }))

    return new Response(
      JSON.stringify({ hospitals: formatted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
