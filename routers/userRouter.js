const { SingUp, SingIn } = require("../controllers/userControllers");
const router = require("express").Router()



router.route("signup")
    .post(SingUp)

router.route("/signin")
    .post(SingIn)


module.exports = router;    