const API_PATH = import.meta.env.VITE_API_URL

export const apiFetch = async (path: string, options?: RequestInit) => {
    console.log(typeof path, path)

    // 1. Check if the body is a FormData object
    const isFormData = options?.body instanceof FormData;

    // 2. Conditionally construct headers
    const customHeaders: Record<string, string> = {
        ...((options?.headers as Record<string, string>) || {})
    };

    // Only inject JSON content type if it's NOT a multipart FormData upload
    if (!isFormData && !customHeaders["Content-Type"]) {
        customHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_PATH}${path}`, {
        credentials: 'include',
        ...options,         // Spread options first
        headers: customHeaders // Apply our intelligently calculated headers last
    })

    const rawText = await res.text()

    let parsedData = null
    try {
        if (rawText) parsedData = JSON.parse(rawText)
    } catch {
        parsedData = null
    }

    if (!res.ok) {
        const message = parsedData?.message || parsedData?.error || `Request Failed: ${res.status}`
        if (!parsedData) console.log('Server HTML Error Response: ', rawText)
        throw new Error(message)
    }   

    return parsedData
}
