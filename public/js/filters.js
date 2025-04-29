document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); // prevents dropdown from closing on click
    });
  });


  
let dietary = [];
let waitTime = Infinity;
let rating = 5;


let requestConfig = {
    method: 'GET',
    url: '/api/diningList'
  };

let filter = document.getElementById('dietary');

$.ajax(requestConfig).then(function (responseMessage) {
    let dietaryRestrictions = [];

    responseMessage.forEach((restaurant) => {
    dietaryRestrictions.push(...restaurant.dietaryRestrictions);
    });

    dietaryRestrictions = [...new Set(dietaryRestrictions)];

    dietaryRestrictions.map((restrictions) => {
      let element = $(
        `<li><label><input type="checkbox" value="${restrictions}">${restrictions}</label></li>
        `
      );
      
      //append the restriction
      $(filter).append(element);
      
      
    });

    $('#dietary input').change(function() {
        if (this.checked === true) dietary.push(this.value);
        else if (this.checked === false) {
            const index = dietary.indexOf(this.value);
            if (index > -1) { 
            dietary.splice(index, 1); 
            }
        }
        rerender();
      });
  });


$('#waitTime input').click(function() {
    waitTime = this.value;
    if (waitTime === 'None') waitTime = Infinity;
    rerender();
  });

$('#rating input').click(function() {
    rating = this.value;
    rerender();
  });

function waitTimeConversion (time) {

    if (time === "") return 0;

    const [hour, minutes] = time.split(" ");

    let h = parseInt(hour);
    let m = parseInt(minutes);

    h = h * 60
    m = h + m
    return m;

}

function filt (d, w, r, rest) {
    for (let i = 0; i < rest.length; i++) {
        const restI = rest[i];
        if (waitTimeConversion(restI.averageWaitTime) > w) {
            const index = rest.indexOf(i);
            rest.splice(index, 1); 
        }
        if (restI.averageRating > r) {
            const index = rest.indexOf(i);
            rest.splice(index, 1);
        }
        if ((!d.some(item => restI.dietaryRestrictions.includes(item))) && (d.length != 0) && (restI.dietaryRestrictions.length != 0)) {
            const index = rest.indexOf(i);
            rest.splice(index, 1);
        }
    }
    return rest;
  }
  
  let listedRestaurant = document.getElementById("listRestaurants");

function rerender() {
$.ajax(requestConfig).then(function (responseMessage) {
    
    const filteredRestaurants = filt(dietary, waitTime, rating, responseMessage);

    // Clear old list
    $(listedRestaurant).empty();
    

    filteredRestaurants.map((restaurant) => {
      let menuList = restaurant.menuItems.map(item => `<li>${item.name}</li>`).join('');
      let element = $(
        `<li>
            <a href = "/diningList/${restaurant._id}">
                <h2 id = "restName">${restaurant.name}</h2>
                <img src = "${restaurant.imageURL}" class = "restaurant_img" alt = "${restaurant.name}" >    
            </a>
            <details>
            <summary class = "caret-summary"> <span class="caret"></span> Menu Items</summary>
            <ul class = "menuItems" >
                ${menuList}
            <ul>
            </details> 
        </li>
        `
      );
      
      //append the restaurant
      $(listedRestaurant).append(element);
      
    });
  });
}

  


//   {{#each restaurantList}}
//   <li>
//       <a href = "/diningList/{{this._id}}">
//           <h2 id = "restName">{{this.name}}</h2>
//           <img src = "{{this.imageURL}}" class = "restaurant_img" alt = "{{this.name}}" >    
//       </a>                   
//      <details>
//       <summary class = "caret-summary"> <span class="caret"></span> Menu Items</summary>
//           <ul>
//               {{#each menuItems}}
//               <li>{{name}}</li>
//               {{/each}}
//           </ul>
//       </details>
//   </li>
      
// {{/each}}



rerender();





