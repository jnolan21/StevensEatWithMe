import {Router} from 'express';
const router = Router();


router.route('/landingPage').get(async (req, res) => {
  try{
    res.render('landingPage/landingPage');
  }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
});

router.route('/diningList').get(async (req, res) => {
  try {
    res.render('diningList/diningList', {title: "EatWithMe Dining List"})  } 
  catch (e) {
    return res.status(400).json({error: e.message});
  }
  
});
router.route('/meetupPage').get(async (req, res) => {
  try{
    res.render('meetupPage/meetupPage', {title: "EatWithMe Meetup Page"})
  }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
});


export default router;