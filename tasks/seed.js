import { ObjectId } from 'mongodb';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import users from '../data/users.js';
import restaurants from '../data/restaurants.js';
import reviews from '../data/reviews.js';
import menuItems from '../data/menuItems.js';
import rsvps from '../data/rsvps.js'

// Command to run seed.js: node ./tasks/seed.js

const db = await dbConnection();
await db.dropDatabase();


// createVerifiedUser() (user1)
let user1;
try {
    user1 = await users.createVerifiedUser("  Atilla ", " Duck ", " atilla@stevens.edu", "atilla1 ", " Hello_world1234 ");
    //console.log(user1);
} catch (e) {
    console.error(`${e.message}`);
}

// createVerifiedUser() (user2)
let user2;
try {
    user2 = await users.createVerifiedUser("  Donald ", " Duck ", " thedon@stevens.edu", "donaldd1 ", " Quack123$Quack ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createVerifiedUser() (user3)
let user3;
try {
    user3 = await users.createVerifiedUser("  Foo ", " Bar ", " foobar@stevens.edu", " foobar01 ", " The_Foo_Bar_OG123 ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createAdminUser() (user4)
let user4;
try {
    user4 = await users.createAdminUser("  The ", " Admin ", " admin@stevens.edu", " admin ", " The_0Admin0_Of_EatWithMe ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createRestaurant() (pom and honey)
let pom;
try {
    pom = await restaurants.createRestaurant(
        "   Pom & Honey  ",
        " University Center, 1st Floor  ",
        [],
        [" Mediterranean" ],
        {
            "Sunday": "11:00AM - 10:00PM",
            "Monday": "11:00AM - 10:00PM",
            "Tuesday": "11:00AM - 10:00PM",
            "Wednesday": "11:00AM - 10:00PM",
            "Thursday": "11:00AM - 10:00PM",
            "Friday": "11:00AM - 10:00PM",
            "Saturday": "11:00AM - 10:00PM"
        },
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN0lY8SA898YVU4Ud5TTeamDW2T7LpeTWvTw&s",
        ["Vegan", "Vegetarian", "Dairy-free", "Soy-free", "Nut-free", "Gluten-free"]
    );
    //console.log(pierceDiningHall);
} catch (e) {
    console.log("POM AND HONEY ERROR")
    console.log(`${e.message}`);
}

// createRestaurant() (piccola italia)
let piccolaItalia;
try {
    piccolaItalia = await restaurants.createRestaurant(
        "   Piccola Italia  ",
        " University Center, 1st Floor ",
        [],
        [" Italian Food "],
        {
            "Sunday": "11:00AM - 8:00PM",
            "Monday": "11:00AM - 8:00PM",
            "Tuesday": "11:00AM - 8:00PM",
            "Wednesday": "11:00AM - 8:00PM",
            "Thursday": "11:00AM - 8:00PM",
            "Friday": "11:00AM - 8:00PM",
            "Saturday": "11:00AM - 8:00PM"
        },
        "https://api.dineoncampus.com/files/images/9688976f-2c14-4865-9248-6fef4de251cd.png",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log("PICCOLA ITALIA ERROR")
    console.log(`${e.message}`);
}


// createRestaurant() (pierceDiningHall)
let pierceDiningHall;
try {
    pierceDiningHall = await restaurants.createRestaurant(
        "   Pierce Dining Hall  ",
        " 2nd Floor of Wesley J. Howe Center ",
        [],
        [" Mixed-Cuisine ", " Comfort Food ", " Fast Food  "],
        {
            "Sunday": "10:00AM - 10:00PM",
            "Monday": "7:00AM - 12:00AM",
            "Tuesday": "7:00AM - 12:00AM",
            "Wednesday": "7:00AM - 12:00AM",
            "Thursday": "7:00AM - 12:00AM",
            "Friday": "7:00AM - 12:00AM",
            "Saturday": "10:00AM - 10:00PM"
        },
        "https://www.stevens.edu/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fmviowpldu823%2F41klnCv1DtziHVpmeNc0ga%2Fdfc437bb7c8fa978efd6b1eae344dd09%2FPierce_Dining_Hall__9_.jpg%3Fw%3D640%26h%3D360%26f%3Dcenter%26q%3D80%26fit%3Dfill&w=2400&q=80",
        ["Vegan", "Vegetarian", "Dairy-free", "Soy-free", "Nut-free", "Gluten-free"]
    );
    //console.log(pierceDiningHall);
} catch (e) {
    console.log("PIERCE ERROR")
    console.log(`${e.message}`);
}

// createRestaurant() (yellas)
let yellas;
try {
    yellas = await restaurants.createRestaurant(
        "   Yellas  ",
        " University Center, 1st Floor ",
        [],
        [" Mixed-Cuisin ", " Comfort Food ", " Fast Food  "],
        {
            "Sunday": "9:00AM - 12:00AM",
            "Monday": "9:00AM - 12:00AM",
            "Tuesday": "9:00AM - 12:00AM",
            "Wednesday": "9:00AM - 12:00AM",
            "Thursday": "9:00AM - 12:00AM",
            "Friday": "9:00AM - 12:00AM",
            "Saturday": "9:00AM - 12:00AM"
        },
        "https://yellas.com/wp-content/uploads/2024/06/yellas-burgers-shakes-deli-sandwiches.jpg",
        ["Vegan", "Vegeterian"]
    );
    //console.log(yellas);
} catch (e) {
    console.log("YELLAS ERROR")
    console.log(`${e.message}`);
}


//////POM AND HONEY  MENU ITEMS////////////////////

// createMenuItem() (chicken bowl)
let byochix;
try {
    byochix = await menuItems.createMenuItem(
        pom._id,
        " Build Your Own Chicken Bowl ",
        "Choose a base of lettuce or rice. Add an extra protein (veggie option available). Choose 4 toppings like cheese, hummus or vegetables. Choose a dressing.",
        ["Dairy-free", "Soy-free", "Nut-free", "Gluten-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (falafel bowl)
let byofalafel;
try {
    byofalafel = await menuItems.createMenuItem(
        pom._id,
        " Build Your Own Falafel Bowl ",
        "Choose a base of lettuce or rice. Add an extra protein (veggie option available). Choose 4 toppings like cheese, hummus or vegetables. Choose a dressing.",
        ["Dairy-free", "Vegetarian", "Vegan", "Nut-free", "Gluten-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (meatball bowl)
let byomeatball;
try {
    byomeatball = await menuItems.createMenuItem(
        pom._id,
        " Build Your Own Spicy Meatball Bowl ",
        "Choose a base of lettuce or rice. Add an extra protein (veggie option available). Choose 4 toppings like cheese, hummus or vegetables. Choose a dressing.",
        ["Nut-free", "Gluten-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (cauliflower bowl)
let byoveg;
try {
    byoveg = await menuItems.createMenuItem(
        pom._id,
        " Build Your Own Roasted Cauliflower and Chickpea Bowl ",
        "Choose a base of lettuce or rice. Add an extra protein (veggie option available). Choose 4 toppings like cheese, hummus or vegetables. Choose a dressing.",
        ["Vegetarian", "Vegan", "Nut-free", "Gluten-free", "Dairy-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (tomato and cucumber salad)
let tomsalad;
try {
    tomsalad = await menuItems.createMenuItem(
        pom._id,
        " Tomato and Cucumber Salad ",
        "Tomatoes and sliced cucumbers, served with a dressing on the side. ",
        ["Vegetarian", "Vegan", "Nut-free", "Gluten-free", "Dairy-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (pita chips and hummus)
let pitahum;
try {
    pitahum = await menuItems.createMenuItem(
        pom._id,
        " Pita Chips and Hummus ",
        "Pita chips served with hummus.",
        ["Vegetarian", "Vegan", "Nut-free", "Gluten-free", "Dairy-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}



//////PICCOLA ITALIA MENU ITEMS////////////////////

// createMenuItem() (chicken parm)
let chickenParm;
try {
    chickenParm = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Chicken Parmesan Sub ",
        " Hand breaded crispy chicken, topped with mozzarella cheese and zesty marinara sauce served on an Italian roll and sesame bun.",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}
// createMenuItem() (meatball sub)
let meatballSub;
try {
    meatballSub = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Meatball Sub ",
        " Classic beef meatballs on a sesame seed italian roll.",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (eggplant parm sub)
let eggplantParm;
try {
    eggplantParm = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Eggplant Parmesan Sub ",
        " Hand breaded crispy eggplant topped with mozarella and parmesan cheeses and zesty marinara sauce served on a sesame seed italian roll.",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (vegetarian meatball sub)
let vegMeatball;
try {
    vegMeatball = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Vegetarian Meatball Sub ",
        " Vegetarian meatball sub.",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (mixed green salad)
let greenSalad;
try {
    greenSalad = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Mixed Green Salad",
        " Mixed greens, cucumber, carrots.",
        ["Vegetarian", "Nut-free", "Gluten-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (broccoli cheddar soup)
let broccSoup;
try {
    broccSoup = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Broccoli Cheddar Soup ",
        " Broccoli Cheddar Soup. ",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (Cheese ravioli)
let ravioli;
try {
    ravioli = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Cheese Ravioli ",
        " Cheese ravioli in a blush sauce. ",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (baked mac)
let bakedMac;
try {
    bakedMac = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Baked Macaroni and Cheese ",
        " Baked macaroni and cheese. ",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (flatbread)
let flatbread;
try {
    flatbread = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Margherita Flatbread ",
        " Fresh mozzarella, plum tomatoes, and fresh basil with balsamic drizzle. ",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (plain pizza)
let cheesepiz;
try {
    cheesepiz = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Cheese Pizza ",
        " Personal cheese pizza. ",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (pepporoni pizza)
let peppopiz;
try {
    peppopiz = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Pepperoni Pizza ",
        " Personal pepperoni pizza. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (veggie pizza)
let vegpiz;
try {
    vegpiz = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Veggie Pizza ",
        " Personal veggie pizza. ",
        ["Vegetarian", "Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (buffalo chicken pizza)
let buffpiz;
try {
    buffpiz = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Special: Buffalo Chicken Pizza ",
        " Personal buffalo chicken and ranch pizza. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (choc chip cookie)
let cookie;
try {
    cookie = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Chocolate Chip Cookie ",
        " Chocolate chip cookie ",
        ["Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (brownie)
let brownie;
try {
    brownie = await menuItems.createMenuItem(
        piccolaItalia._id,
        " Classic Fudge Brownie ",
        " Classic fudge brownie ",
        ["Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}




//////PIERCE DINING HALL MENU ITEMS////////////////////

// createMenuItem() (menuItem1)
let menuItem1;
try {
    //console.log(pierceDiningHall)
    //console.log(yellas);
    menuItem1 = await menuItems.createMenuItem(
        pierceDiningHall._id,
        " Grilled Chicken Cheddar Sandwich ",
        " Grilled chicken, cheddar cheeese, lettuce, tomato, and onion on a whole wheat roll. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}


//////YELLAS MENU ITEMS////////////////////



// createMenuItem() (uncleBabe)
let uncleBabe;
try {
    uncleBabe = await menuItems.createMenuItem(
        yellas._id,
        " The Uncle Babe ",
        " Hot Sub : Deluxe Ham, Salami, Fresh Mozzarella, Roasted Peppers. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (fatAngelo)
let fatAngelo;
try {
    fatAngelo = await menuItems.createMenuItem(
        yellas._id,
        " The Fat Angelo ",
        " Hot Sub : Sliced Steak, Roasted Potatoes, Peppers & Onions, American Cheese, Sub Roll. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (bennyBrown)
let bennyBrown;
try {
    bennyBrown = await menuItems.createMenuItem(
        yellas._id,
        " The Benny Brown ",
        " Hot Sub : Sliced Steak, Sauteed Onions, Fresh Mozzarella, Brown Gravy, Sesame Seed Sub Roll. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (CHIPOTLE CHIX CHEESESTEAK)
let chipotleCheeseSteak;
try {
    chipotleCheeseSteak = await menuItems.createMenuItem(
        yellas._id,
        " Chipotle Chicken Cheesesteak ",
        " Chicken breast, grilled onions, pepper jack cheese, arugula, tomato, chipotle mayo on a sesame seed roll. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (gpa joe)
let gpaJoe;
try {
    gpaJoe = await menuItems.createMenuItem(
        yellas._id,
        " The Grandpa Joe Steak ",
        " Sliced steak, sauteed onions, provolone cheese, and hot banana peppers on a sesame seed roll. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (lombardi)
let lombardi;
try {
    lombardi = await menuItems.createMenuItem(
        yellas._id,
        " The Lombardi ",
        " Crispy chicken breast, fresh mozzarella, roasted peppers, sundried tomato pesto, sesame seed sub roll. ",
        []
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (eggplan milanese)
let eggMil;
try {
    eggMil = await menuItems.createMenuItem(
        yellas._id,
        " Eggplant Milanese ",
        " Crispy fried eggplant, provolone cheese, arugula, roasted red peppers, and balsamic glazed on a sesame seeded italian hero. ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (yellas sub)
let yellassub;
try {
    yellassub = await menuItems.createMenuItem(
        yellas._id,
        " The Yellas Sub ",
        " Prosciuttini, hot ham, salami, provolone. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (torpedo sub)
let torpedo;
try {
    torpedo = await menuItems.createMenuItem(
        yellas._id,
        " The Torpedo Sub ",
        " Salami, fresh mozzarella, sundried tomato pesto. ",
        []
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (nuclear sub)
let nuclear;
try {
    nuclear = await menuItems.createMenuItem(
        yellas._id,
        " The Nuclear Sub ",
        " Hot ham, pepper jack cheese, hot banana peppers. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (talking turkey sub)
let turkeysub;
try {
    turkeysub = await menuItems.createMenuItem(
        yellas._id,
        " The Talking Turkey Sub ",
        " Turkey, pepper jack cheese, chipotle mayo. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( turkey club sub)
let turkeyClub;
try {
    turkeyClub = await menuItems.createMenuItem(
        yellas._id,
        " The Turkey Club Sub ",
        " Turkey, swiss cheese, bacon, mayo. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( crispy chix sam)
let crispyChix;
try {
    crispyChix = await menuItems.createMenuItem(
        yellas._id,
        " Crispy Chicken Sandwich ",
        " Crispy chicken breast, lettuce, pickles, lemon aioli, potato roll ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( buff chix sam)
let buffChixSam;
try {
    buffChixSam = await menuItems.createMenuItem(
        yellas._id,
        " Buffalo Chicken Sandwich ",
        " Crispy chicken breast, lettuce, buffalo sauce, ranch dressing, potato roll ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( Bacon ranch chix sam)
let baconRanch;
try {
    baconRanch = await menuItems.createMenuItem(
        yellas._id,
        " Chicken Bacon Ranch Sandwich ",
        " Crispy chicken breast, bacon, provolone cheese, lettuce, tomato, ranch dressing, potato roll ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( nashville chix sam)
let nashville;
try {
    nashville = await menuItems.createMenuItem(
        yellas._id,
        " Nashville Hot Sandwich ",
        " Crispy Nashville spiced chicken breast, coleslaw, pickles, potato roll ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( grilled chix sam)
let grilledChix;
try {
    grilledChix = await menuItems.createMenuItem(
        yellas._id,
        " Grilled Chicken Sandwich ",
        " Marinated chicken, lettuce, tomato, lemon aioli, potato roll ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( 3 chix tenders)
let threecountChix;
try {
    threecountChix = await menuItems.createMenuItem(
        yellas._id,
        " 3-Count Jumbo Chicken Tenders ",
        " 3 hand-breaded jumbo chicken tenders, with a choice of flavor (BBQ, plain, buffalo, Nashville hot, garlic parmesan, lemon pepper dry rub). Served with a choice of sauce. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( 6 chix tenders)
let sixcountChix;
try {
    sixcountChix = await menuItems.createMenuItem(
        yellas._id,
        " 6-Count Jumbo Chicken Tenders ",
        " 6 hand-breaded jumbo chicken tenders, with a choice of flavor (BBQ, plain, buffalo, Nashville hot, garlic parmesan, lemon pepper dry rub). Served with a choice of sauce. ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( hamburger)
let hamburger;
try {
    hamburger = await menuItems.createMenuItem(
        yellas._id,
        " Hamburger ",
        " Yellas burger blend, pickles, ketchup, potato roll. *Veggie Burger available* ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( cheeseburger)
let cheeseburger;
try {
    cheeseburger = await menuItems.createMenuItem(
        yellas._id,
        " Classic Cheeseburger ",
        " Yellas burger blend, white American cheese, pickles, ketchup, potato roll. *Veggie Burger available* ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( yella burger )
let yellaburger;
try {
    yellaburger = await menuItems.createMenuItem(
        yellas._id,
        " The Yella Burger ",
        " Yellas burger blend, cheddar cheese, lettuce, tomato, onions, pickles, secret sauce, potato roll. *Veggie Burger available* ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( bacon cheese burger )
let baconCheeseB;
try {
    baconCheeseB = await menuItems.createMenuItem(
        yellas._id,
        " Bacon Cheeseburger ",
        " Yellas burger blend, bacon, cheddar cheese, pickles, secret sauce, potato roll. *Veggie Burger available* ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( jersey smash burger )
let jerseySmash;
try {
    jerseySmash = await menuItems.createMenuItem(
        yellas._id,
        " Jersey Smash Burger ",
        " Yellas burger blend, shaved sweet onions, white American cheese, pickles, secret sauce, potato roll. *Veggie Burger available* ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( cowboy burger )
let cowboy;
try {
    cowboy = await menuItems.createMenuItem(
        yellas._id,
        " The Cowboy Burger ",
        " Double yellas blend burger patties, bacon, cheddar cheese, onion rings, banana peppers, BBQ sauce, potato roll. *Veggie Burger available* ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( milkshakes )
let milkshake;
try {
    milkshake = await menuItems.createMenuItem(
        yellas._id,
        " Classic Hand Spun Shake ",
        " Caramel, Chocolate, Strawberry, or Vanilla ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( waffleFries )
let waffleFries;
try {
    waffleFries = await menuItems.createMenuItem(
        yellas._id,
        " Sweet Potato Waffle Fries ",
        " Crispy criss-cut sweet potatoes. ",
        ["Nut-free", "Vegetarian", "Dairy-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( onionRings )
let onionRings;
try {
    onionRings = await menuItems.createMenuItem(
        yellas._id,
        " Onion Rings ",
        " Crispy breaded Spanish onion rings. ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( fries )
let fries;
try {
    fries = await menuItems.createMenuItem(
        yellas._id,
        " French Fries ",
        " Crispy skin-on fries. Sea salt.  ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( egg and cheese )
let eggAndCheese;
try {
    eggAndCheese = await menuItems.createMenuItem(
        yellas._id,
        " Egg & Cheese ",
        " Over medium egg, American cheese, potato roll.  ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( bacon egg and cheese )
let bec;
try {
    bec = await menuItems.createMenuItem(
        yellas._id,
        " Bacon, Egg & Cheese ",
        " Over medium egg, bacon, American cheese, potato roll.  ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( sausage egg and cheese )
let sec;
try {
    sec = await menuItems.createMenuItem(
        yellas._id,
        " Sausage, Egg & Cheese ",
        " Over medium egg, sausage, American cheese, potato roll.  ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( taylor ham egg and cheese )
let tec;
try {
    tec = await menuItems.createMenuItem(
        yellas._id,
        " Taylor Ham, Egg & Cheese ",
        " Over medium egg, taylor ham, American cheese, potato roll.  ",
        ["Nut-free"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( pancakes )
let pancakes;
try {
    pancakes = await menuItems.createMenuItem(
        yellas._id,
        " Pancakes ",
        " Pancakes with syrup.  ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() ( frnech toast )
let ftoast;
try {
    ftoast = await menuItems.createMenuItem(
        yellas._id,
        " French Toast Sticks",
        " French toast sticks with syrup.  ",
        ["Nut-free", "Vegetarian"]
    );
} catch (e) {
    console.log(`${e.message}`);
}


// getAllMenuItems() (yellas)
try {
    let yellasMenuItems = await menuItems.getAllMenuItems(yellas._id);
    //console.log(yellasMenuItems);
} catch (e) {
    console.log(`${e.message}`);
}



// getMenuItemById() (The Fat Angelo)
try {
    let angelo = await menuItems.getMenuItemById(fatAngelo._id.toString());
    //console.log(angelo);
} catch (e) {
    console.log(`${e.message}`);
}

// getRestaurantById() (The Fat Angelo)
try {
    let shouldBePierce = await menuItems.getRestaurantId(menuItem1._id.toString());
    let shouldBeYellas = await menuItems.getRestaurantId(fatAngelo._id.toString());
    //let invalidId = await menuItems.getRestaurantId('67fc00807aeca18a74809187');
    //console.log(pierce);
    //console.log(yellas);
    //console.log(invalidId);
} catch (e) {
    console.log(`${e.message}`);
}


// createReview() (review1) - review for 'The Fat Angelo'
let review1;
try {
    review1 = await reviews.createMenuItemReview(
        user1._id,
        yellas._id,
        fatAngelo._id.toString(),
        " The Fat Angelo is the best sub I've had in my life! ",
        5,
        "0h 22min"
    );
    //console.log(review1);
} catch (e) {
    console.log(`${e.message}`);
}


// createReview() create 4 reviews for yellas menu items
let reviewData = [
    {
        user: user2._id,
        restaurant: yellas._id,
        menuItem: fatAngelo._id.toString(),
        text: "It was cold when I got it, so much for 'Hot Subs'.",
        rating: 1,
        time: "0h 33min"
    },
    {
        user: user1._id,
        restaurant: yellas._id,
        menuItem: menuItem1._id.toString(),
        text: "Tasted like cardboard with cheese on it.",
        rating: 2,
        time: "0h 20min"
    },
    {
        user: user3._id,
        restaurant: yellas._id,
        menuItem: uncleBabe._id.toString(),
        text: "Decent, but definitely overpriced for what it is.",
        rating: 3,
        time: "0h 40min"
    },
    {
        user: user2._id,
        restaurant: yellas._id,
        menuItem: bennyBrown._id.toString(),
        text: "Honestly pretty good, would get it again.",
        rating: 4,
        time: "0h 25min"
    }
];

// Add the 4 menu item reviews to yellas
for (const data of reviewData) {
    try {
        const review = await reviews.createMenuItemReview(
            data.user,
            data.restaurant,
            data.menuItem,
            data.text,
            data.rating,
            data.time
        );
    } catch (e) {
        console.log(`${e.message}`);
    }
}


// createReview() create 4 reviews for yellas menu items
let menuItemReviewData = [
    {
        user: user2._id,
        restaurant: yellas._id,
        text: " Decent food, took forever to get it though. ",
        rating: 1,
        time: "  1h 01min  "
    },
    {
        user: user1._id,
        restaurant: yellas._id,
        text: "My go to spot for good subs!",
        rating: 5,
        time: "0h 20min"
    },
    {
        user: user3._id,
        restaurant: yellas._id,
        text: "Nothing crazy. Decent food and service.",
        rating: 3,
        time: "0h 40min"
    },
    {
        user: user2._id,
        restaurant: yellas._id,
        text: "I don't even know what to say. Don't eat here!",
        rating: 0,
        time: "2h 12min"
    }
];

// Add the 4 menu item reviews to yellas
for (const data of menuItemReviewData) {
    try {
        const review = await reviews.createRestaurantReview(
            data.user,
            data.restaurant,
            data.text,
            data.rating,
            data.time
        );
    } catch (e) {
        console.log(`${e.message}`);
    }
}


// addFriend() - add user2 to user1's friend list
try {
    let user1FriendsList = await users.addFriend(user1._id, user2._id);
    //console.log(user1FriendsList);
} catch (e) {
    console.error(`${e.message}`);
}

/* addFriend() - Error user2 is already in user1's friend list
try {
    let user1FriendsList = await users.addFriend(user1._id, user2._id);
    console.log(user1FriendsList);
} catch (e) {
    console.error(`${e.message}`);
}
*/

// removeFriend() - remove user2 from user1's friend list
try {
    let user1FriendsList = await users.removeFriend(user1._id, user2._id);
    //console.log(user1FriendsList);
} catch (e) {
    console.error(`${e.message}`);
}



//create RSVPS

try{
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');  
    const day = String(today.getDate()).padStart(2, '0');         
    const year = today.getFullYear();                            
    const formattedDate = `${month}/${day}/${year}`;

    let rsvpPost1 = await rsvps.createRsvp(
        "Hi! Im a freshman looking for someone to get chicken tenders with me!",
        {Date: formattedDate, Time:"10:00PM"},
        yellas._id,
        user1._id
    )
}
catch(e){
    console.error(`${e.message}`)
}
try{
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');  
    const day = String(today.getDate()).padStart(2, '0');         
    const year = today.getFullYear();                            
    const formattedDate = `${month}/${day}/${year}`;

    let rsvpPost2 = await rsvps.createRsvp(
        "Hi! Im a duck looking for love at late night Pierce!",
        {Date: formattedDate, Time:"11:00PM"},
        pierceDiningHall._id,
        user2._id
    )
}
catch(e){
    console.error(`${e.message}`)
}











console.log('Done seeding database');

await closeConnection();