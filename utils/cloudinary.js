function getCloudinaryDetails(url) {
  try {
    // Remove query parameters if any
    const cleanUrl = url.split("?")[0];
    // Split by '/' to analyze parts
    const parts = cleanUrl.split("/");
    // Find the index of 'upload' keyword
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) throw new Error("Invalid Cloudinary URL");
    // Extract resource type (e.g., image, raw, video)
    const resourceType = parts[uploadIndex - 1];
    // Get everything after 'upload'
    const relevantParts = parts.slice(uploadIndex + 1);
    // If version part exists (starts with 'v' followed by digits), remove it
    const withoutVersion = relevantParts[0].startsWith("v")
      ? relevantParts.slice(1)
      : relevantParts;
    // Join back as path
    let publicIdWithExt = withoutVersion.join("/");
    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
    console.log(publicId);
    return {
      public_id: publicId,
      resource_type: resourceType,
    };
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export { getCloudinaryDetails };
