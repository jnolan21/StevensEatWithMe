import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import reviewData from '../data/reviews.js';
import restaurants from '../data/restaurants.js';
import menuItems from '../data/menuItems.js';
import xss from 'xss'
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Get the admin page
router
  .route('/')
  .get(async (req, res) => {
    // Verify that the user is logged in
    if (!req.session.user) {
        return res.status(403).redirect('/users/login');
    }
    // Verify that the user is an admin
    if (!req.session.user.isAdmin) {
        return res.status(403).redirect('/profile')
    }

    let id = req.session.user._id.toString();
    let isAdmin = true;
    try {
        id = helper.checkId(id);
    } catch (e) {
        // If the id is invalid, render the error page
        return res.status(400).render('errors/error', {
            title: "400 Bad Request",
            error: 'Invalid session user ID. Please log out and log back in.',
            status: 400
          });
    }

    // Get the user
    let user = req.session.user;

    // Store the relevant req.session parameters
    const reviewDeleted = req.session.reviewDeleted || false;
    const restaurantDeleted = req.session.restaurantDeleted || false;
    const menuItemDeleted = req.session.menuItemDeleted || false;
    const restaurantDetails = restaurantDeleted || menuItemDeleted
    const editingRestaurant = req.session.editingRestaurant || false;
    const editingMenuItem = req.session.editingMenuItem || false;
    const restaurant = req.session.restaurantInfo || false;
    const menuItem = req.session.menuItemInfo || false;
    const message = req.session.message || null;
    const restaurantDietaryCheckBox = req.session.restaurantDietaryCheckBox || null;
    const menuItemDietaryCheckBox = req.session.menuItemDietaryCheckBox || null;

    // Get all users reviews
    let reviews;
    try{
        reviews = await reviewData.getAllReviewsWithInfo();
    }
    catch(e){
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Get all the users
    let allUsers;
    try {
        allUsers = await userData.getAllUsers();
        // Remove the current user from 'allUsers'
        allUsers = allUsers.filter((user) => {
            return id !== user._id.toString();
        })
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Get all the restaurants
    let allRestaurants;
    try {
        allRestaurants = await restaurants.getAllRestaurants();
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Get the restaurant for a menu item, if editing said menu item
    if (menuItem && menuItem.restaurantId) {
        const selectedRestaurantId = menuItem.restaurantId;
        for (let i = 0; i < allRestaurants.length; i++) {
            const restaurantId = allRestaurants[i]._id;
            allRestaurants[i].isSelected = (restaurantId.toString() === selectedRestaurantId.toString()) ? true : false;
        }
    }

    // Determine if a menu item has any reviews
    helper.addHasReviewsKey(allRestaurants);

    // Render the user's admin page
    try {
        res.render('users/admin', {
            title: "EatWithMe Admin Page",
            // Send the relevant information about the user
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                reviews // array of review objects
            },
            //partial: 'adminScript',
            days: days,
            allUsers: allUsers,
            allRestaurants: allRestaurants,
            reviewDeleted,
            restaurantDetails,
            menuItemDeleted,
            editingRestaurant,
            editingMenuItem,
            restaurant,
            menuItem,
            restaurantDietaryCheckBox,
            menuItemDietaryCheckBox,
            message,
            script: 'adminScript',
            isLoggedIn: !!req.session.user,
            isAdmin
        });
        // Clear the 'deleted' flags
        helper.clearAdminSession(req.session);
        return;
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }

  });


/* Delete reviews */
router 
.post('/delete', async (req, res) => {
    if (!req.body.reviewId) {
        req.session.message = 'Review ID is missing.';
        return res.status(400).redirect('/admin');
    }
    let reviewId = xss(req.body.reviewId);
    try{
        reviewId = helper.checkId(reviewId);
    } catch (e) {
        req.session.message = 'Invalid review ID.';
        return res.status(400).redirect('/admin');
    }
    try {
        await reviewData.deleteReview(reviewId);
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the review.";
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: req.session.message,
            status: 500
        });
    }
    req.session.message = "Deleted Review!"; 
    req.session.reviewDeleted = true;
    res.redirect('/admin');
});


/* Delete restaurants */
router 
.post('/restaurant/delete', async (req, res) => {
    if (!req.body.restaurantId) {
        req.session.message = 'Restaurant ID is missing.';
        return res.status(400).redirect('/admin');
    }
    let restaurantId = xss(req.body.restaurantId);
    try{
        restaurantId = helper.checkId(restaurantId);
    } catch (e) {
        req.session.message = 'Invalid restaurant ID.';
        return res.status(400).redirect('/admin');
    }
    try {
        await restaurants.removeRestaurant(restaurantId);
    } catch (e){
        req.session.message = e.message || "Something went wrong deleting the restaurant.";
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: req.session.message,
            status: 500
        });
    }
    req.session.message = "Deleted Restaurant!"; 
    req.session.restaurantDeleted = true;
    res.redirect('/admin');
});

/* Get restaurant info for editing */
router
.get('/restaurant/edit/:id', async (req, res) => {
    let id = xss(req.params.id);
    try {
        id = helper.checkId(id);
    } catch (e) {
        req.session.message = 'Invalid restaurant ID.';
        return res.status(400).redirect('/admin');
    }
    let restaurant;
    try {
        restaurant = await restaurants.getRestaurantById(id);
    } catch (e) {
        req.session.message = `Restaurant not found with ID: '${id}'.`;
        return res.status(400).redirect('/admin');
    }
    try {
    // Convert the array of strings, to strings
        restaurant.typeOfFood = helper.stringArrayToString(restaurant.typeOfFood, "Restaurant types of food");
        restaurant.dietaryRestrictions = helper.checkDietaryRestrictions(restaurant.dietaryRestrictions);
    } catch (e) {
        req.session.message = e.message;
        return res.status(400).redirect('/admin');
    }
    // Create the dietaryCheckBox object
    let dietaryCheckBox = {};
    try {
        dietaryCheckBox = helper.buildDietaryCheckBox(restaurant.dietaryRestrictions);
    } catch (e) {
        req.session.message = e.message;
        return res.status(400).redirect('/admin');
    }
    req.session.editingRestaurant = true;
    req.session.restaurantInfo = restaurant;
    req.session.restaurantDietaryCheckBox = dietaryCheckBox;
    res.redirect('/admin');
})


/* Edit restaurants */
router
.put('/restaurant/edit', async (req, res) => {
    let restaurantId, name, dietaryRestrictions, location, typeOfFood, hoursOfOperation, imageURL;
    try{
        dietaryRestrictions = helper.fixDietaryInput(req.body.dietaryRestrictions);
        // Verify the restaurant info
        restaurantId = helper.checkId(xss(req.body.restaurantId));
        name = helper.checkString(xss(req.body.name), "Restaurant name");
        location = helper.checkString(xss(req.body.location), "Restaurant location");
        typeOfFood = helper.stringToArray(xss(req.body.typeOfFood), "Restaurant types of food");
        hoursOfOperation = helper.checkHoursOfOperation(helper.xssForObjects(req.body.hoursOfOperation));
        imageURL = helper.checkImgURL(xss(req.body.imageURL));
        dietaryRestrictions = helper.xssForArrays(dietaryRestrictions);
        dietaryRestrictions = helper.checkDietaryRestrictions(dietaryRestrictions);
        // Update the restaurant
        await restaurants.updateRestaurant(
            restaurantId,
            name,
            location,
            typeOfFood,
            hoursOfOperation,
            imageURL,
            dietaryRestrictions
        );
        req.session.editingRestaurant = false;
        req.session.message = "Restaurant updated successfully!";
        res.redirect('/admin');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong updating the restaurant.";
        req.session.editingRestaurant = true;
        req.session.restaurantInfo = {
            _id: restaurantId,
            name: req.body.name,
            location: req.body.location,
            typeOfFood: req.body.typeOfFood,
            hoursOfOperation: req.body.hoursOfOperation,
            imageURL: req.body.imageURL,
            dietaryRestrictions: req.body.dietaryRestrictions
        };
        let dietaryRestrictions = helper.fixDietaryInput(req.body.dietaryRestrictions);
        req.session.restaurantDietaryCheckBox = helper.buildDietaryCheckBox(dietaryRestrictions);
        return res.status(400).redirect('/admin');
    }
});



/* Create restaurants */
router
  .route('/restaurant')
  .post(async (req, res) => {
    // Create a new restaurant
    let errors = [];
    // Use xss on each value in hoursOfOperation
    let hoursOfOperation = {};
    try {
        hoursOfOperation = helper.xssForObjects(req.body.hoursOfOperation);
    } catch (e) {
        errors.push(`Invalid 'hours of operation' input type: ${e.message}`);
    }
    // Use xss on each value in dietaryRestrictions
    let dietaryRestrictions = helper.fixDietaryInput(req.body.dietaryRestrictions);
    let restaurant = {
        name: xss(req.body.name),
        location: xss(req.body.location),
        typeOfFood: xss(req.body.typeOfFood),
        hoursOfOperation: hoursOfOperation,
        imageURL: xss(req.body.imageURL),
        dietaryRestrictions: dietaryRestrictions
    }
    try {
        restaurant.name = helper.checkString(restaurant.name, 'Restaurant name');
    } catch (e) {
        errors.push(e.message);
    }
    if (restaurant.name && errors.length == 0) {
        try {
        // Check if restaurant already exists with that name
        let checkRestaurantName = await restaurants.getRestaurantByName(restaurant.name);
        if (checkRestaurantName !== null) errors.push(`Restaurant already exists with the name '${restaurant.name}'`);
        } catch (e) {
            return res.status(500).render('errors/error', {
                title: "500 Internal Server Error",
                error: e.message,
                status: 500
            });
        }
    }
    try {
        restaurant.location = helper.checkString(restaurant.location, 'Restaurant location');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.typeOfFood = helper.stringToArray(restaurant.typeOfFood, 'Restaurant types of food');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.hoursOfOperation = helper.checkHoursOfOperation(restaurant.hoursOfOperation);
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.imageURL = helper.checkImgURL(restaurant.imageURL);
    } catch (e) {
        errors.push(e.message);
    }
    try {
        // Make dietaryRestrictions into an array
        restaurant.dietaryRestrictions = helper.fixDietaryInput(restaurant.dietaryRestrictions);
        restaurant.dietaryRestrictions = helper.checkDietaryRestrictions(restaurant.dietaryRestrictions);
    } catch (e) {
        errors.push(e.message);
    }
    // Create the dietaryCheckBox object
    let dietaryCheckBox = {};
    if (restaurant.dietaryRestrictions) {
        dietaryCheckBox = helper.buildDietaryCheckBox(restaurant.dietaryRestrictions);
    }
    // Reload with errors if needed
    if (errors.length > 0) {
        req.session.message = errors[0];
        req.session.restaurantInfo = restaurant;
        req.session.restaurantDietaryCheckBox = dietaryCheckBox;
        return res.status(400).redirect('/admin');
      }

    // Add the restaurant to the database
    try {
        await restaurants.createRestaurant(
            restaurant.name,
            restaurant.location,
            [],
            restaurant.typeOfFood,
            restaurant.hoursOfOperation,
            restaurant.imageURL,
            restaurant.dietaryRestrictions
        );
        req.session.message = `New restaurant created successfully!`;
        return res.redirect('/admin');
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
  });


/* Delete menu items */
router 
.post('/menuItem/delete', async (req, res) => {
    if (!req.body.menuItemId) {
        req.session.message = 'Menu item ID is missing.';
        return res.status(400).redirect('/admin');
    }
    //receive menuItemId
    let menuItemId = xss(req.body.menuItemId);
    try {
        menuItemId = helper.checkId(menuItemId);
    } catch (e) {
        req.session.message = 'Invalid menu item ID.';
        return res.status(400).redirect('/admin');
    }
    try {
        await menuItems.removeMenuItem(menuItemId);
    } catch (e) {
        req.session.message = e.message || "Something went wrong deleting the menu item.";
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: req.session.message,
            status: 500
        });
    }
    req.session.message = "Deleted Menu Item!"; 
    req.session.menuItemDeleted = true;
    res.redirect('/admin');
});

/* Get menu item info for editing */
router
.get('/menuItem/edit/:id', async (req, res) => {
    let id = xss(req.params.id);
    try {
        id = helper.checkId(id);
    } catch (e) {
        req.session.message = 'Invalid menu item ID.';
        return res.status(400).redirect('/admin');
    }
    let menuItem;
    try {
        menuItem = await menuItems.getMenuItemById(id);
    } catch (e) {
        req.session.message = `Menu item not found with ID: '${id}'.`;
        return res.status(400).redirect('/admin');
    }
    try {
        menuItem.dietaryRestrictions = helper.checkDietaryRestrictions(menuItem.dietaryRestrictions);
    } catch (e) {
        req.session.message = e.message;
        return res.status(400).redirect('/admin');
    }
    // Create the dietaryCheckBox object
    let dietaryCheckBox = {};
    try {
        dietaryCheckBox = helper.buildDietaryCheckBox(menuItem.dietaryRestrictions);
    } catch (e) {
        req.session.message = e.message;
        return res.status(400).redirect('/admin');
    }
    req.session.editingMenuItem = true;
    req.session.menuItemInfo = menuItem;
    req.session.menuItemDietaryCheckBox = dietaryCheckBox;
    res.redirect('/admin');
})


/* Edit menu items */
router
.put('/menuItem/edit', async (req, res) => {
    let errors = [];
    // Use xss on each value in dietaryRestrictions
    let dietaryRestrictions;
    if (Array.isArray(req.body.dietaryRestrictions)) {
        dietaryRestrictions = helper.xssForArrays(req.body.dietaryRestrictions);
    } else if (typeof req.body.dietaryRestrictions === 'string' && req.body.dietaryRestrictions.trim() !== '') {
        dietaryRestrictions = [xss(req.body.dietaryRestrictions)];
    } else if (req.body.dietaryRestrictions === '' || req.body.dietaryRestrictions === undefined) {
        dietaryRestrictions = [];
    } else {
        errors.push("Invalid 'dietary restrictions' input type.")
    }
    let menuItem = {
        _id: xss(req.body.menuItemId),
        restaurantId: xss(req.body.restaurantId),
        name: xss(req.body.name),
        description: xss(req.body.description),
        dietaryRestrictions: dietaryRestrictions
    }
    // Verify the admin input
    try {
        menuItem._id = helper.checkId(menuItem._id);
    } catch (e) {
        errors.push(e.message);
    }
    try {
        menuItem.restaurantId = helper.checkId(menuItem.restaurantId);
    } catch (e) {
        errors.push(e.message);
    }
    try {
        menuItem.name = helper.checkString(menuItem.name, "Menu item name");
    } catch (e) {
        errors.push(e.message);
    }
    try {
        menuItem.description = helper.checkString(menuItem.description, "Menu item description");
    } catch (e) {
        errors.push(e.message);
    }
    try {
        menuItem.dietaryRestrictions = helper.fixDietaryInput(menuItem.dietaryRestrictions);
        menuItem.dietaryRestrictions = helper.checkDietaryRestrictions(menuItem.dietaryRestrictions);
    } catch (e) {
        errors.push(e.message);
    }
    // Reload with errors if needed
    if (errors.length > 0) {
        req.session.message = errors[0];
        req.session.editingMenuItem = true;
        req.session.menuItemInfo = menuItem;
        req.session.menuItemDietaryCheckBox = helper.buildDietaryCheckBox(menuItem.dietaryRestrictions);
        return res.status(400).redirect('/admin');
    }
    // Update the menu item
    try {
        await menuItems.updateMenuItem(
            menuItem._id,
            menuItem.restaurantId,
            menuItem.name,
            menuItem.description,
            menuItem.dietaryRestrictions
        );
        req.session.message = "Menu item updated successfully!";
        return res.redirect('/admin');
    } catch (e) {
        req.session.message = e.message || "Something went wrong updating the menu item.";
        req.session.editingMenuItem = true;
        req.session.menuItemInfo = menuItem;
        req.session.menuItemDietaryCheckBox = helper.buildDietaryCheckBox(menuItem.dietaryRestrictions);
        return res.redirect('/admin');        
    }
});



/* Create menu items */
router
  .route('/menuItem')
  .post(async (req, res) => {
    // Create a new menu item
    let errors = [];
    // Use xss on each value in dietaryRestrictions
    let dietaryRestrictions;
    if (Array.isArray(req.body.dietaryRestrictions)) {
        dietaryRestrictions = helper.xssForArrays(req.body.dietaryRestrictions);
    } else if (typeof req.body.dietaryRestrictions === 'string' && req.body.dietaryRestrictions.trim() !== '') {
        dietaryRestrictions = [xss(req.body.dietaryRestrictions)];
    } else if (req.body.dietaryRestrictions === '' || req.body.dietaryRestrictions === undefined) {
        dietaryRestrictions = [];
    } else {
        errors.push("Invalid 'dietary restrictions' input type.")
    }
    // Verify all menu item fields
    let menuItem = {
        restaurantId: xss(req.body.restaurantId),
        name: xss(req.body.name),
        description: xss(req.body.description),
        dietaryRestrictions: dietaryRestrictions
    }
    try {
        menuItem.restaurantId = helper.checkId(menuItem.restaurantId);
    } catch (e) {
        errors.push(e.message);
    }    
    try {
        menuItem.name = helper.checkString(menuItem.name, 'Menu item name');
    } catch (e) {
        errors.push(e.message);
    }
    if (menuItem.name) {
        try {
            // Check if menu item already exists with that name
            let checkMenuItemName = await menuItems.getMenuItemByName(menuItem.name, menuItem.restaurantId);
            if (checkMenuItemName !== null) errors.push(`Menu item already exists with the name '${menuItem.name}'`);
        } catch (e) {
            errors.push(e);
        }
    }
    try {
        menuItem.description = helper.checkString(menuItem.description, 'Menu item description');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        // Make dietaryRestrictions into an array
        menuItem.dietaryRestrictions = helper.fixDietaryInput(menuItem.dietaryRestrictions);
        menuItem.dietaryRestrictions = helper.checkDietaryRestrictions(menuItem.dietaryRestrictions);
    } catch (e) {
        errors.push(e.message);
    }

    // Create the dietaryCheckBox object
    let dietaryCheckBox = {};
    if (menuItem.dietaryRestrictions) {
        dietaryCheckBox = helper.buildDietaryCheckBox(menuItem.dietaryRestrictions);
    }
    // Reload with errors if needed
    if (errors.length > 0) {
        req.session.message = errors[0];
        req.session.menuItemInfo = menuItem;
        req.session.menuItemDietaryCheckBox = dietaryCheckBox;
        return res.status(400).redirect('/admin');
    }

    // Add the menu item to the database
    try {
        await menuItems.createMenuItem(
            menuItem.restaurantId,
            menuItem.name,
            menuItem.description,
            menuItem.dietaryRestrictions
        );
        let restaurant = await restaurants.getRestaurantById(menuItem.restaurantId);
        req.session.message = `New menu item, '${menuItem.name}', successfully added to '${restaurant.name}'!`;
        return res.redirect('/admin');
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
  });



/* Remove admin privileges */
router 
.post('/changeAdmin/:id', async (req, res) => {
    // Receive user Id from URL
    let id = xss(req.params.id);
    try {
        id = helper.checkId(id);
    } catch (e) {
        req.session.message = e.message;
        return res.status(400).redirect('/admin');
    }
    let isAdmin;
    try {
        isAdmin = await userData.changeAdminPrivileges(id);
    } catch (e) {
        req.session.message = e.message;
        return res.status(400).redirect('/admin');
    }
    if (isAdmin) req.session.message = 'Admin privileges granted.'
    else req.session.message = 'Admin privileges revoked.'
    return res.redirect('/admin');
});


export default router;