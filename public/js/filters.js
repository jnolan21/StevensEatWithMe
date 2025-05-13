

document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); // prevents dropdown from closing on click
    });
  });


  
let dietary = [];
let waitTime = Infinity;
let rating = 0;
let filterForm = $('.dropdown-form');
let error = document.getElementById('filterError');

filterForm.on('submit', function(e) {
  e.preventDefault();  

  error.textContent = '';
  
  try {
    
    if (waitTime) {
    if (waitTime == Infinity) waitTime = 'Infinity';
    if (typeof waitTime !== 'string') throw "waitTime should be a string";
    } else {
      waitTime = Infinity;
    }
    if (rating) {
      parseInt(rating);
    } else rating = 0;
    if (dietary) {
      if (!Array.isArray(dietary)) throw "Dietary Restrictions must be an array"
    } 
    }catch(e) {
      error.textContent = e;
      return;
    }

  let requestConfig = {
    method: 'POST',               
    url: '/api/diningList',
    contentType: 'application/json',     
    data: JSON.stringify({
      waitTime: waitTime,
      rating: rating,
      dietary: dietary
    }),              
  };
  $.ajax(requestConfig).then(function (responseMessage) {
    render(responseMessage);
  });    
});

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

  dietaryRestrictions.forEach((restrictions) => {
      let element = $(`<li><label><input type="checkbox" value="${restrictions}">${restrictions}</label></li>`);
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
      try {
      if (!Array.isArray(dietaryRestrictions)) throw "Must be an array";
      } catch(e) {
        return false;
      }
    });
    render(responseMessage);
});







$('#waitTime input').click(function() {
    waitTime = this.value;
    //console.log(typeof waitTime);
    if (waitTime === 'None') waitTime = Infinity;
    //rerender();
  });

$('#rating input').click(function() {
  rating = Number(this.value);
    
    //rerender();
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
    for (let i = rest.length - 1; i >= 0; i--) {
        const restI = rest[i];
        if (
            waitTimeConversion(restI.averageWaitTime) > w ||
            restI.averageRating < r ||
            (d.length !== 0 &&
            !d.every(restriction => restI.dietaryRestrictions.includes(restriction)))
        ) {
            rest.splice(i, 1);
        }
    }
    return rest;
  }
  
  let listedRestaurant = document.getElementById("listRestaurants");



function render(restaurants) {
  //const filteredRestaurants = filt(dietary, waitTime, rating, responseMessage);

    // Clear old list
    $(listedRestaurant).empty();
    

    restaurants.forEach((restaurant) => {
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
            </ul>
            </details> 
        </li>
        `
      );
      
      //append the restaurant
      $(listedRestaurant).append(element);
      
    });
}


  





