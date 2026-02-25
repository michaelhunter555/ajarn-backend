const Screening = require("../../models/screenings");

const getScreenings = async (req, res, next) => {
    const { page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 7;

    let screenings;
    try {
        screenings = await Screening.find({})
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        const totalScreenings = await Screening.countDocuments({});
        const totalPages = Math.ceil(totalScreenings / limitNum);
        res.status(200).json({
            screenings,
            totalPages,
            pageNum,
            totalScreenings,
        });
    } catch(err) {
        const error = new HttpError("there was an error finding the screenings", 500);
        return next(error);
    }
}

module.exports = getScreenings;
