const Recruitment = require("../../models/recruitment");
const User = require("../../models/users");
const HttpError = require("../../models/http-error");
const mongoose = require("mongoose");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { handleNewRecruitment } = require("../../lib/brevoHelper");
const { getIO, NotificationsList, checkRoom } = require("../../lib/socket");

const recruitTeacher = async (req, res, next) => {
  const { recruitment } = req.body;

  if (!recruitment.creatorId) {
    const nextError = new HttpError(
      "You need a creator account to recruit teachers.",
      400
    );
    return next(nextError);
  }
  const recruitmentExists = await Recruitment.exists({ teacherId: recruitment.teacherId, jobId: recruitment.jobId });
  if (recruitmentExists) {
    return res.status(200).json({ message: "Recruitment offer already sent to this teacher for this job.", ok: true, exists: true });
  };

  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const sanitizedMessage = DOMPurify.sanitize(recruitment.message);

  const newRecruitmentData = {
    teacherId: recruitment.teacherId,
    jobId: recruitment.jobId,
    creatorId: recruitment.creatorId,
    jobTitle: recruitment.jobTitle,
    salary: recruitment.salary,
    location: recruitment.location,
    company: recruitment.company,
    datePosted: new Date(),
    response: "pending",
    recruitmentMessage: sanitizedMessage,
  };

  const newRecruitment = new Recruitment(newRecruitmentData);
  const io = getIO();
  let sess;
  try {
    const user = await User.findById(recruitment.userId);
    const teacher = await User.findById(recruitment.teacherId);

    if (!user) {
      const error = new HttpError("Could not find a user by the given id", 400);
      return next(error);
    }
    if (!teacher) {
      const error = new HttpError(
        "Could not find a teacher by the given id",
        400
      );
      return next(error);
    }

    sess = await mongoose.startSession();
    sess.startTransaction();

    await newRecruitment.save({ session: sess });
    user.recruitmentSent.push(newRecruitment._id);
    await user.save({ session: sess });

    teacher.recruitmentReceived.push(newRecruitment._id);
    await teacher.save({ session: sess });
    await sess.commitTransaction();

   if(newRecruitment) {
    //send email notification to teacher
    await handleNewRecruitment(
      teacher.email,
      teacher.name,
      recruitment.company,
      recruitment.jobTitle,
      recruitment.salary,
      recruitment.location,
      newRecruitmentData.recruitmentMessage,
      newRecruitment.jobId,
    );

    //send socket notification to teacher if active on site
    io.to(String(teacher._id)).emit(NotificationsList.newRecruitmentOffer, {
        jobTitle: recruitment.jobTitle,
        salary: recruitment.salary,
        location: recruitment.location,
        employerName: user.name,
        employerImage: user.image,
        recruitmentId: newRecruitment._id,
      });
 }
    res
      .status(201)
      .json({ message: "Recruitment sent successfully", ok: true });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was error with the request to apply to the job",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }
};

module.exports = recruitTeacher;
