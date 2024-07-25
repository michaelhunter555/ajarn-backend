const User = require("../../models/users");
const HttpError = require("../../models/http-error");

const toggleUserTheme = async (req, res, next) => {
  const userId = req.params.userId;
  const { theme } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new HttpError(
        "Could not find a user by the given id.",
        404
      );
      return next(error);
    }

    user.theme = theme;
    await user.save();
    res.status(200).json({ message: "Theme updated successfully.", ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Theme failed to update.", ok: false });
  }
};

module.exports = toggleUserTheme;
