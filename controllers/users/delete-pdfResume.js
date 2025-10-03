const cloudinary = require("cloudinary");
const HttpError = require("../../models/http-error");
const User = require("../../models/users");

function extractCloudinaryPublicId(fileUrl) {
  if (!fileUrl) return null;
  const parts = fileUrl.split("/upload/");
  if (parts.length !== 2) return null;
  const pathWithExt = parts[1];
  // Remove extension (e.g., .pdf)
  return pathWithExt.replace(/\.[a-zA-Z0-9]+$/, "");
}

const deletePdfResume = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!req.userData || req.userData.userId.toString() !== userId.toString()) {
      const error = new HttpError("You are not authorized to delete this PDF resume.", 401);
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new HttpError("User not found.", 404);
      return next(error);
    }

    if (!user.pdfResume) {
      return res.status(200).json({ message: "No PDF resume to delete.", ok: true });
    }

    const publicId = extractCloudinaryPublicId(user.pdfResume);

    if (!publicId) {
      const error = new HttpError("Invalid PDF resume URL.", 400);
      return next(error);
    }

    // Try deleting as an image (common for PDFs in Cloudinary), then fallback to raw
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (err) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch (innerErr) {
        return next(new HttpError("Failed to delete PDF resume from Cloudinary.", 500));
      }
    }

    user.pdfResume = "";
    await user.save();

    return res.status(200).json({ message: "PDF resume deleted successfully.", ok: true });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Deleting PDF resume failed.", 500));
  }
};

module.exports = deletePdfResume;