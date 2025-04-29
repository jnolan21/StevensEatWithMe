document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); // prevents dropdown from closing on click
    });
  });

  let listedRestaurant = document.getElementById("listRestaurants");


  let requestConfig = {
    method: 'GET',
    url: '/api/diningList'
  };

  $.ajax(requestConfig).then(function (responseMessage) {
    console.log(responseMessage);
    responseMessage.map((restaurant) => {
      let element = $(
        `<li>
            <a href = "/diningList/${restaurant._id}">
                <h2 id = "restName">${restaurant.name}</h2>
                <img src = "${restaurant.imageURL}" class = "restaurant_img" alt = "${restaurant.name}" >    
            </a>
        </li> 
        `
      );
      //append the restaurant
      $(listedRestaurant).append(element);
    });
  });

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

let form = document.getElementById('dropdown-form');
let dietaryFilter = document.getElementById('dietaryFilter');
let waitTimeFiler = document.getElementById('waitTimeFilter');
let ratingFilter = document.getElementById('ratingFilter'); 