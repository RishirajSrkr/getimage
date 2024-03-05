var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer')

passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', function (req, res) {
  res.render('register', { nav: false })
})

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
  // console.log(user);
  res.render('profile', { user, nav: true })
})

router.get('/show/posts', isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
  res.render('show', { user, nav: true })
})

//show individual image
router.get('/show/posts/:postid', isLoggedIn, async function (req, res) {
  const postid = req.params.postid;
  const post = await postModel.findOne({ _id: postid }).populate('user') //populating user because in the showsingle image page, I want to extract out actual data from user (its username), and not just the reference.
  // console.log(post);
  res.render('showSingle', { post, nav: true })
})


router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
  // res.render('profile', {user}) we can do this here aswell
})


router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find()
    .limit(25)
    .populate('user')
  // console.log(posts);
  res.render('feed', { user, posts, nav: true })
})

router.get('/add', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('add', { user, nav: true })
})

router.post('/createpost', upload.single('postimage'), isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile')
})


router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}),
  function (req, res) { });


router.post('/register', function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    // name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname,
  })
  // console.log(userData);

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile')
      })
    })

})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

router.get('/loggeduser', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.send(user);
})

module.exports = router;
