export async function verifyDigitalSignature(digitalSignature: string): Promise<{ success: boolean; data: any }> {
  try {
    const response = await fetch("/api/verify-secret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secretId: digitalSignature }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, data }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error verifying digital signature:", error)
    return { success: false, data: { message: error.message || "Failed to verify digital signature" } }
  }
}

export async function requestDigitalSignature(email: string): Promise<{ success: boolean; data: any }> {
  try {
    const response = await fetch("/api/generate-secret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, data }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error requesting digital signature:", error)
    return { success: false, data: { message: error.message || "Failed to request digital signature" } }
  }
}

export async function submitVote(digitalSignature: string, encryptedVote: string): Promise<{ success: boolean; data: any }> {
  try {
    const response = await fetch("/api/submit-vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secretId: digitalSignature, encryptedVote }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, data }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error submitting vote:", error)
    return { success: false, data: { message: error.message || "Failed to submit vote" } }
  }
}

export async function generateForAll() {
  try {
    const res = await fetch("/api/generate-for-all", {
      method: "POST",
    });

    const data = await res.json();

    return { success: res.ok, data };
  } catch (error) {
    console.error("Error calling generateForAll:", error);
    return { success: false, data: { message: "Network error" } };
  }
}

// Aliases for backward compatibility
export const verifySecretId = verifyDigitalSignature;
export const requestSecretId = requestDigitalSignature;
