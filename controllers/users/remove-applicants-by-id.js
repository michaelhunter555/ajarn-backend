const Application = require("../../models/application");
const mongoose = require("mongoose");

//remove applicants from jobsApplicantTable
const removeApplicantsById = async (req, res, next) => {
  const { userApplicants } = req.body; //array of ids

  const idArray = Array.isArray(userApplicants)
    ? userApplicants
    : [userApplicants];
  const objectIds = idArray.map((id) => new mongoose.Types.ObjectId(id));

  try {
    await Application.deleteMany({
      _id: { $in: objectIds },
    });
    res
      .status(200)
      .json({ message: "Succesfully deleted applicants.", ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "failed to delete applicants. Please try again",
      ok: false,
    });
  }
};

module.exports = removeApplicantsById;
