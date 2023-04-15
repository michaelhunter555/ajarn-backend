const express = require("express");
const router = express.Router();
const { DUMMY_USERS_LIST } = require("../dummy_data/dummy_users");

router.get("/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const users = DUMMY_USERS_LIST.find((u) => {
    return u.id === userId;
  });

  res.json({ users });
});

module.exports = router;
