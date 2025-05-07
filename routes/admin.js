import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import reviewData from '../data/reviews.js';
import restaurants from '../data/restaurants.js';
import menuItems from '../data/menuItems.js';
//import crypto from 'crypto'
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dietaryRestrictions = ['Vegetarian', 'Nut-free', 'Vegan', 'Dairy-free', 'Gluten-free'];

// Get the admin page
router
  .route('/')
  .get(async (req, res) => {
    // Verify that the user is logged in
    if (!req.session.user) {
        // 403 = forbidden page
        return res.status(403).redirect('/users/login');
    }
    // Verify that the user is an admin
    if (!req.session.user.isAdmin) {
        res.status(403).redirect('/profile')
    }

    let id = req.session.user._id;
    // Determine if an admin is logged in
    let isAdmin = !!(req.session.user && req.session.user.isAdmin);
    try {
        id = helper.checkId(id);
    } catch (e) {
        // If the id is invalid, render the login page
        return res.status(400).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user,
            isAdmin
        })
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
    const dietaryCheckBox = req.session.dietaryCheckBox || null;

    // Get all users reviews
    let reviews = [];
    try{
        reviews = await reviewData.getAllReviewsWithInfo();
    }
    catch(e){
        return res.status(500).render('error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Get all the users
    let allUsers = [];
    try {
        allUsers = await userData.getAllUsers();
    } catch (e) {
        return res.status(500).render('error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Get all the restaurants
    let allRestaurants = [];
    try {
        allRestaurants = await restaurants.getAllRestaurants();
    } catch (e) {
        return res.status(500).render('error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Get the restaurant for a menu item, if editing said menu item
    if (editingMenuItem && menuItem && menuItem.restaurantId) {
        const selectedRestaurantId = menuItem.restaurantId;
        for (let i = 0; i < allRestaurants.length; i++) {
            const restaurantId = allRestaurants[i]._id;
            allRestaurants[i].isSelected = (restaurantId.toString() === selectedRestaurantId.toString()) ? true : false;
        }
    }

    // Render the user's admin page
    try {
        res.render('users/admin', {
            title: "EatWithMe Admin Page",
            // Send the relevant information about the user
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                reviews: reviews // array of review objects
            },
            partial: 'adminScript',
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
            dietaryCheckBox,
            message,
            script: 'adminScript',
            isLoggedIn: !!req.session.user,
            isAdmin
        });
        // Clear the 'deleted' flags
        req.session.reviewDeleted = false;
        req.session.restaurantDeleted = false;
        req.session.menuItemDeleted = false;
        req.session.editingRestaurant = false;
        req.session.editingMenuItem = false;
        req.session.restaurantInfo = null;
        req.session.menuItemInfo = null;
        req.session.message = null;
        req.session.dietaryCheckBox = null;
        return;
    } catch (e) {
        res.status(500).render('error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
        req.session.reviewDeleted = false;
        req.session.restaurantDeleted = false;
        req.session.menuItemDeleted = false;
        req.session.editingRestaurant = false;
        req.session.editingMenuItem = false;
        req.session.restaurantInfo = null;
        req.session.menuItemInfo = null;
        req.session.message = null;
        req.session.dietaryCheckBox = null;
        return;
    }

  });


/* Delete reviews */
router 
.post('/delete', async (req, res) => {
    try{
        //receive reviewId, userId and session.user.userId
        let reviewId = req.body.reviewId;
        reviewId = helper.checkId(reviewId);
        let loggedInUserId = req.session.user._id;
        let reviewPosterId= req.body.userId; 
        await reviewData.deleteReview(reviewId);
        req.session.message = "Deleted Review!"; 
        req.session.reviewDeleted = true;
        res.redirect('/admin');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the review.";
        return res.status(500).redirect('/admin');
    }
});


/* Delete restaurants */
router 
.post('/restaurant/delete', async (req, res) => {
    try{
        //receive restaurantId
        let restaurantId = req.body.restaurantId;
        restaurantId = helper.checkId(restaurantId);
        await restaurants.removeRestaurant(restaurantId);
        req.session.message = "Deleted Restaurant!"; 
        req.session.restaurantDeleted = true;
        res.redirect('/admin');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the restaurant.";
        return res.status(500).redirect('/admin');
    }
});

/* Get restaurant info for editing */
router
.get('/restaurant/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        id = helper.checkId(id);
        let restaurant = await restaurants.getRestaurantById(id);
        // Convert the array of strings, to strings
        restaurant.typeOfFood = helper.stringArrayToString(restaurant.typeOfFood, "Restaurant types of food");
        restaurant.dietaryRestrictions = helper.checkDietaryRestrictions(restaurant.dietaryRestrictions);
        // Create the dietaryCheckBox object
        let dietaryCheckBox = {};
        dietaryRestrictions.forEach(dr => {
            dietaryCheckBox[dr] = restaurant.dietaryRestrictions.includes(dr);
        });
        req.session.editingRestaurant = true;
        req.session.restaurantInfo = restaurant;
        req.session.dietaryCheckBox = dietaryCheckBox;
    } catch (e) {
        req.session.message = e.message || "Failed to load restaurant for editing.";
        return res.status(400).redirect('/admin');
    }
    try {
        return res.redirect('/admin');
    } catch (e) {
        req.session.message = e.message || "Failed to load restaurant for editing.";
        return res.status(500).redirect('/admin');
    }
})


/* Edit restaurants */
router
.put('/restaurant/edit', async (req, res) => {
    try{
        // Verify the restaurant info
        let restaurantId = helper.checkId(req.body.restaurantId);
        let name = helper.checkString(req.body.name, "Restaurant name");
        let location = helper.checkString(req.body.location, "Restaurant location");
        let typeOfFood = helper.stringToArray(req.body.typeOfFood, "Restaurant types of food");
        let hoursOfOperation = helper.checkHoursOfOperation(req.body.hoursOfOperation);
        let imageURL = helper.checkString(req.body.imageURL, "Restaurant image URL");
        let dietaryRestrictions = req.body.dietaryRestrictions || [];
        if (!Array.isArray(dietaryRestrictions)) dietaryRestrictions = [dietaryRestrictions];
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
        req.session.message = null;
        req.session.message = "Restaurant updated successfully!";
        res.redirect('/admin');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong updating the restaurant.";
        return res.status(400).redirect('/admin');
    }
});



/* Create restaurants */
router
  .route('/restaurant')
  .post(async (req, res) => {
    // Create a new restaurant
    let errors = [];
    // Verify all restaurant fields
    let restaurant = req.body;
    try {
        restaurant.name = helper.checkString(restaurant.name, 'Restaurant name');
    } catch (e) {
        errors.push(e.message);
    }
    // Check if restaurant already exists with that name
    let checkRestaurantName = await restaurants.getRestaurantByName(restaurant.name);
    if (checkRestaurantName !== null) errors.push(`Restaurant already exists with the name '${restaurant.name}'`);
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
        restaurant.imageURL = helper.checkString(restaurant.imageURL, 'Restaurant image URL');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        // Make dietaryRestrictions into an array
        restaurant.dietaryRestrictions = restaurant.dietaryRestrictions || [];
        if (!Array.isArray(restaurant.dietaryRestrictions)) restaurant.dietaryRestrictions = [restaurant.dietaryRestrictions];
        restaurant.dietaryRestrictions = helper.checkDietaryRestrictions(restaurant.dietaryRestrictions);
    } catch (e) {
        errors.push(e.message);
    }
    // Get all users reviews
    let user = req.session.user;
    let reviews = [];
    try{
        reviews = await reviewData.getAllReviewsWithInfo();
    }
    catch(e){
        return res.status(500).render('error', {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500
        });
    }
    // Create the dietaryCheckBox object
    let dietaryCheckBox = {};
    dietaryRestrictions.forEach(dr => {
        dietaryCheckBox[dr] = restaurant.dietaryRestrictions.includes(dr);
    });
    // Reload with errors if needed
    if (errors.length > 0) {
        return res.render('users/admin', {
          title: "EatWithMe Admin Page",
          user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            reviews: reviews // array of review objects
          },
          errors: errors,
          hasErrors: true,
          partial: 'adminScript',
          days: days,
          isLoggedIn: !!req.session.user,
          isAdmin: true,
          // Submitted info
          name: restaurant.name,
          location: restaurant.location,
          typeOfFood: restaurant.typeOfFood,
          dietaryCheckBox: dietaryCheckBox,
          //hoursOfOperation: restaurant.hoursOfOperation,
          hoursOfOperation: restaurant.hoursOfOperation,
          imageURL: restaurant.imageURL,
          dietaryRestrictions: restaurant.dietaryRestrictions
        });
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
        req.session.message = e.message || "Server error.";
        return res.status(500).redirect('/admin');
    }
  });


/* Delete menu items */
router 
.post('/menuItem/delete', async (req, res) => {
    try{
        //receive menuItemId
        let menuItemId = req.body.menuItemId;
        menuItemId = helper.checkId(menuItemId);
        await menuItems.removeMenuItem(menuItemId);
        req.session.message = "Deleted Menu Item!"; 
        req.session.menuItemDeleted = true;
        res.redirect('/admin');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the menu item.";
        return res.status(500).redirect('/admin');
    }
});

/* Get menu item info for editing */
router
.get('/menuItem/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        id = helper.checkId(id);
        let menuItem = await menuItems.getMenuItemById(id);
        // Convert the array of strings, to strings
        menuItem.dietaryRestrictions = helper.checkDietaryRestrictions(menuItem.dietaryRestrictions);
        // Create the dietaryCheckBox object
        let dietaryCheckBox = {};
        dietaryRestrictions.forEach(dr => {
            dietaryCheckBox[dr] = menuItem.dietaryRestrictions.includes(dr);
        });
        req.session.editingMenuItem = true;
        req.session.menuItemInfo = menuItem;
        req.session.dietaryCheckBox = dietaryCheckBox;
    } catch (e) {
        req.session.message = e.message || "Failed to load menu item for editing.";
        return res.status(400).redirect('/admin');
    }
    try {
        return res.redirect('/admin');
    } catch (e) {
        req.session.message = e.message || "Failed to load menu item for editing.";
        return res.status(500).redirect('/admin');
    }
})


/* Edit menu items */
router
.put('/menuItem/edit', async (req, res) => {
    let errors = [];
    let menuItem = req.body;
    // Verify the admin input
    try {
        menuItem._id = helper.checkId(menuItem.menuItemId);
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
        menuItem.dietaryRestrictions = menuItem.dietaryRestrictions || [];
        if (!Array.isArray(menuItem.dietaryRestrictions)) menuItem.dietaryRestrictions = [menuItem.dietaryRestrictions];
        menuItem.dietaryRestrictions = helper.checkDietaryRestrictions(menuItem.dietaryRestrictions);
    } catch (e) {
        errors.push(e.message);
    }
    let dietaryCheckBox;
    try {
        // Create the dietaryCheckBox object
        dietaryCheckBox = {};
        menuItem.dietaryRestrictions.forEach(dr => {
            dietaryCheckBox[dr] = menuItem.dietaryRestrictions.includes(dr);
        });
    } catch (e) {
        errors.push(e.message);
    }
    // Reload with errors if needed
    if (errors.length > 0) {
        let user = req.session.user;
        // Get all users reviews
        let reviews = [];
        try{
            reviews = await reviewData.getAllReviewsWithInfo();
        }
        catch(e){
            return res.status(500).render('error', {
                title: "500 Internal Server Error",
                error: e.message,
                status: 500
            });
        }
        // Get all the users
        let allUsers = [];
        try {
            allUsers = await userData.getAllUsers();
        } catch (e) {
            return res.status(500).render('error', {
                title: "500 Internal Server Error",
                error: e.message,
                status: 500
            });
        }
        // Get all the restaurants
        let allRestaurants = [];
        try {
            allRestaurants = await restaurants.getAllRestaurants();
        } catch (e) {
            return res.status(500).render('error', {
                title: "500 Internal Server Error",
                error: e.message,
                status: 500
            });
        }
        return res.render('users/admin', {
            title: "EatWithMe Admin Page",
            user: {
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              reviews: reviews // array of review objects
            },
            errors: errors,
            hasErrors: true,
            partial: 'adminScript',
            days: days,
            isLoggedIn: !!req.session.user,
            isAdmin: true,
            allUsers: allUsers,
            allRestaurants: allRestaurants,
            // Submitted info
            menuItem: menuItem,
            dietaryCheckBox: dietaryCheckBox,
            editingMenuItem: true,
          });
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
        return res.status(500).redirect('/admin');
    }
});



/* Create menu items */
router
  .route('/menuItem')
  .post(async (req, res) => {
    // Create a new restaurant
    let errors = [];
    // Verify all restaurant fields
    let menuItem = req.body;
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
    // Check if menu item already exists with that name
    let checkMenuItemName = await menuItems.getMenuItemByName(menuItem.name, menuItem.restaurantId);
    if (checkMenuItemName !== null) errors.push(`Menu item already exists with the name '${menuItem.name}'`);
    try {
        menuItem.description = helper.checkString(menuItem.description, 'Menu item description');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        // Make dietaryRestrictions into an array
        menuItem.dietaryRestrictions = menuItem.dietaryRestrictions || [];
        if (!Array.isArray(menuItem.dietaryRestrictions)) menuItem.dietaryRestrictions = [menuItem.dietaryRestrictions];
        menuItem.dietaryRestrictions = helper.checkDietaryRestrictions(menuItem.dietaryRestrictions);
    } catch (e) {
        errors.push(e.message);
    }

    // Create the dietaryCheckBox object
    let dietaryCheckBox = {};
    dietaryRestrictions.forEach(dr => {
        dietaryCheckBox[dr] = menuItem.dietaryRestrictions.includes(dr);
    });
    // Reload with errors if needed
    if (errors.length > 0) {
        return res.render('users/admin', {
          title: "EatWithMe Admin Page",
          user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            reviews: reviews // array of review objects
          },
          errors: errors,
          hasErrors: true,
          partial: 'adminScript',
          days: days,
          isLoggedIn: !!req.session.user,
          isAdmin: true,
          // Submitted info
          restaurantId: menuItem.restaurantId,
          name: menuItem.name,
          description: menuItem.description,
          dietaryCheckBox: dietaryCheckBox,
          dietaryRestrictions: menuItem.dietaryRestrictions
        });
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
        req.session.message = e.message || "Server error.";
        return res.status(500).redirect('/admin');
    }
  });


export default router;