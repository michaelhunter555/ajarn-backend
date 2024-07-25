const Recruitment = require("../../models/recruitment");
const User = require("../../models/users");
const mongoose = require("mongoose");
//remove recruitments sent to teachers (employers)
const removeRecruitById = async (req, res, next) => {
  const { recruitIds } = req.body;

  //make sure it's an array. If not, make it an array.
  const recruitIdArr = Array.isArray(recruitIds) ? recruitIds : [recruitIds];
  const recruitObjectIds = recruitIdArr.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  //find all recruit documentsById in delete operation
  const recruits = await Recruitment.find({ _id: { $in: recruitObjectIds } });
  let teacherIds = [];

  //loop over recruit array and push ids if not already there
  //declare creator - req.userData.userId
  for (const recruit of recruits) {
    if (!teacherIds.includes(recruit.teacherId.toString())) {
      teacherIds.push(recruit.teacherId.toString());
    }
  }

  //find all the teacherIds
  const teachers = await User.find({ _id: { $in: teacherIds } });

  //atomic update for user and recruitments
  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    //delete each recruitment offer in operation
    await Recruitment.deleteMany(
      { _id: { $in: recruitObjectIds } },
      { session: sess }
    );

    // Update teachers (recruited users)
    for (const teacher of teachers) {
      recruitIdArr.forEach((id) => {
        teacher.recruitmentReceived.pull(id);
      });
      await teacher.save({ session: sess });
    }

    //remove the recruitment ids from the employers array
    const user = await User.findById(req.userData.userId).session(sess);
    if (user) {
      recruitIdArr.forEach((id) => {
        user.recruitmentSent.pull(id);
      });
      await user.save({ session: sess });
    }
    await sess.commitTransaction();
    res
      .status(200)
      .json({ message: "Recruitments deleted successfully.", ok: true });
  } catch (err) {
    if (sess) {
      await sess.abortTransaction();
    }
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to delete recruitments " + err, ok: false });
    return next(err);
  } finally {
    if (sess) {
      await sess.endSession();
    }
  }
};

module.exports = removeRecruitById;
